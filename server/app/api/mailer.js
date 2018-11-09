// @flow
const fs = require('fs');
const nodemailer = require('nodemailer');
const pug = require('pug');

const {
  MAILER_ADDRESS,
  MAILER_PASS,
} = process.env;

const rAddress = typeof MAILER_ADDRESS === 'string' ? MAILER_ADDRESS.trim() : '';
const rPass = typeof MAILER_PASS === 'string' ? MAILER_PASS.trim() : '';

if (rAddress.length === 0) {
  throw new Error('Set mailer address (MAILER_ADDRESS in .conf)');
}

if (rPass.length === 0) {
  throw new Error('Set mailer password (MAILER_PASS in .conf)');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: rAddress,
    pass: rPass,
  },
});

const fromString = `"${Config.name}" <${rAddress}>`;

const getEmailTemplates = (folderPath: string): Object => {
  const CACHE: { [string]: any } = {};

  const templateVars = {
    AppUrl: Config.domain,
    AppName: Config.name,
    AppFullUrl: Config.url,
    AppProtocol: Config.protocol,
    SupportEmail: Config.supportEmail,
    AppEmail: rAddress,
  };

  return {
    async get(template: string, data: Object): Promise<string> {
      return new Promise((resolve, reject) => {
        const vars = Object.assign({}, data, templateVars);

        if (template in CACHE) {
          resolve(CACHE[template](vars));
        } else {
          const fileFullName = `${folderPath}/${template}.pug`;

          fs.stat(fileFullName, (error, stats) => {
            if (error) {
              reject(error);
              return;
            }

            if (!stats.isFile()) {
              reject(new Error(`Not found "${fileFullName}" file (get email template)`));
              return;
            }

            CACHE[template] = pug.compileFile(fileFullName);
            resolve(CACHE[template](vars));
          });
        }
      });
    },
  };
};

const getMailer = (templatePath: string): Object => {
  const emailTemplates = getEmailTemplates(templatePath);

  return {
    emailAddress: rAddress,

    async sendTo(email: string, options: Object): Promise<Object> {
      const rOptions = Object.assign({}, options);
      const nowTime = new Date();
      const nowUTCString = Tools.dateAsUTCString(nowTime);

      rOptions.from = fromString;
      rOptions.to = email;

      if (rOptions.template) {
        const templateData = {
          NowTime: nowTime,
          NowUTCString: nowUTCString,
        };

        Object.assign(templateData, rOptions.data);
        rOptions.html = await emailTemplates.get(rOptions.template, templateData);
      }

      let subject = `【${Config.name}】`;

      if (typeof rOptions.subject === 'string') {
        subject += `${rOptions.subject} `;
      }

      subject += `- ${nowUTCString} (UTC)`;
      rOptions.subject = subject;

      return new Promise((resolve, reject) => {
        transporter.sendMail(rOptions, (error, info) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(info);
        });
      });
    },

    async verify(): Promise<?boolean> {
      return new Promise((resolve, reject) => {
        transporter.verify((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(true);
        });
      });
    },
  };
};

const mailerGenerator = (templatePath: string): Promise<Object> => {
  return new Promise((resolve, reject) => {
    fs.stat(templatePath, (error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (!stats.isDirectory()) {
        const notFoundError = new Error(`Not found "${templatePath}" directory (email templates config)`);
        reject(notFoundError);
        return;
      }

      const mailer = getMailer(templatePath);
      resolve(mailer);

      /*
      mailer.verify().then(() => {
        resolve(mailer);
      }).catch(reject);
      */
    });
  });
};

module.exports = mailerGenerator;
