// @flow
const faker = require('faker');
const cron = require('node-cron');
const collection = require('./collections/members');
const userMonthPaymentsCollection = require('../users/collections/month-payments');

const DIFF_EARNINGS = 1500;
const MEMBERS_COUNT = 15;
const ITERATION_EARNINGS = DIFF_EARNINGS * 0.5;

const getRandomEarningsFrom = (fromVal: number) => {
  const toVal = fromVal + ITERATION_EARNINGS;
  const rVal = Math.floor(Math.random() * toVal) + fromVal;
  return rVal;
};

const getMaxEarningsInMonth = (): Promise<number> => {
  const nowDate = new Date();
  const monthYearStr = `${nowDate.getMonth()}_${nowDate.getFullYear()}`;

  const retPromise = new Promise((resolve, reject) => {
    userMonthPaymentsCollection.find({
      monthYear: monthYearStr,
    }).sort('earnings', -1).limit(1).toArray((error, items) => {
      if (error) {
        reject(error);
        return;
      }

      if (items.length > 0) {
        resolve(items[0].earnings);
        return;
      }

      resolve(DIFF_EARNINGS);
    });
  });

  return retPromise;
};

const competition = Object.freeze({
  async getMembers() {
    const items = await collection.find({}).sort('value', -1).toArray();
    return items;
  },

  async deleteMembers() {
    await collection.deleteMany({});
  },

  async generateMembers() {
    let maxEarnings = await getMaxEarningsInMonth();
    await collection.deleteMany({});
    maxEarnings += DIFF_EARNINGS;
    const newMembers: Object[] = [];
    let newMembersLength = newMembers.length;
    let i = 0;

    for (; i < MEMBERS_COUNT; i += 1) {
      const member = {
        name: faker.name.firstName(),
        id: faker.random.number(),
        value: getRandomEarningsFrom(maxEarnings),
      };

      newMembers[newMembersLength] = member;
      newMembersLength += 1;
    }

    await collection.insertMany(newMembers);

    return this.getMembers();
  },
});

const updateValues = () => {
  competition.getMembers().then((items) => {
    const itemsLength = items.length;
    const newMembers: Object[] = [];
    let newMembersLength = newMembers.length;
    let i = 0;

    for (; i < itemsLength; i += 1) {
      const item = Object.assign({}, items[i]);
      item.value += getRandomEarningsFrom(0);
      delete item._id;
      newMembers[newMembersLength] = item;
      newMembersLength += 1;
    }

    collection.deleteMany({}, (dError) => {
      if (!dError) {
        collection.insertMany(newMembers);
      }
    });
  }).catch(() => {});
};

setInterval(updateValues, 3600000);

cron.schedule('0 0 1 * *', () => {
  competition.getMembers().then((items) => {
    if (items.length > 0) {
      competition.generateMembers();
    }
  }).catch(() => {});
});

module.exports = competition;
