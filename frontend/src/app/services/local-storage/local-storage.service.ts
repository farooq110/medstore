import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private _storage: Storage | null = null;

  constructor(private readonly storage: Storage) {}

  ionViewWillEnter() {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async setItem(key: string, value: any) {
    value = JSON.stringify(value);
    this._storage = await this.isCheckStorage();
    await this._storage?.set(key, value);
    return true;
  }

  public async getItem(key: string) {
    this._storage = await this.isCheckStorage();
    const value = (await this._storage?.get(key)) as string;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  public async removeItem(key: string) {
    this._storage = await this.isCheckStorage();
    const value = (await this._storage?.remove(key)) as string;
  }

  public async clear() {
    this._storage = await this.isCheckStorage();
    this._storage?.clear();
  }

  private async isCheckStorage() {
    if (!this._storage) this._storage = await this.storage.create();
    return this._storage;
  }
}
