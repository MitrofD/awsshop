declare var asHOT: Function;
declare var Config: Object;
declare var Enums: Object;
declare var isDevMode: boolean;
declare var NumberFormat: Function;
declare var RootNode: Object;
declare var Tools: Object;
declare var showConfirmModal: Function;
declare var showAppError: Function;

declare type SubscribeHandler = {
  stop: Function,
};

declare type SubscribesStore = {
  [string]: Function,
};
