declare var Config: Object;
declare var Enums: Object;
declare var isDevMode: boolean;
declare var Mailer: Object;
declare var MongoStore: Object;
declare var Middleware: Object;
declare var RedisStore: Object;
declare var Tools: Object;
declare var Translations: Object;
declare var RootPath: string;
declare var Port: number;
declare var Server: Object;
declare var GSession: Object;

declare type Errors = { [string]: any };

declare type ObjectWithErrors<T> = {
  errors?: Errors,
  data?: T,
};

declare type ErrorsPromise<T> = Promise<ObjectWithErrors<T>>;

declare type MongoID = Object | string;

type VerificationData = {|
  date: Date,
  code: string,
|};

type User = {
  _id: string,
  email: string,
  ethAddress: string,
  isAdmin: boolean,
  isBlocked?: Date,
  verification?: string,
  verificationResetPassword?: VerificationData,
};
