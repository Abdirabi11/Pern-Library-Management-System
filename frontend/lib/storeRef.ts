import type { Store } from "@reduxjs/toolkit";

let _store: Store | null = null;

export function setStore(store: Store) {
  _store = store;
}

export function getStore() {
  return _store;
}
