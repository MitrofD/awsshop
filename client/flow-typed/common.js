declare var asHOT: Function;
declare var Config: Object;
declare var Enums: Object;
declare var isDevMode: boolean;
declare var NotificationBox: Object;
declare var NumberFormat: Function;
declare var Tools: Object;
declare var proxyPath: string;
declare var RootNode: Object;
declare var showConfirmModal: Function;

declare type SubscribeHandler = {
  stop: Function,
};

declare type SubscribesStore = {
  [string]: Function,
};
