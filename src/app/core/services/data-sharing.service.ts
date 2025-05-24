import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private dataStore: Map<string, any> = new Map<string, any>();

  /**
   * Lưu dữ liệu với một key cụ thể
   * @param key Khóa định danh dữ liệu
   * @param data Dữ liệu cần lưu
   */
  setData(key: string, data: any): void {
    this.dataStore.set(key, { ...data }); // Sao chép để tránh tham chiếu
  }

  /**
   * Lấy dữ liệu theo key
   * @param key Khóa định danh
   * @returns Dữ liệu hoặc null nếu không tìm thấy
   */
  getData(key: string): any | null {
    return this.dataStore.get(key) || null;
  }

  /**
   * Xóa dữ liệu theo key
   * @param key Khóa định danh
   */
  clearData(key: string): void {
    this.dataStore.delete(key);
  }

  /**
   * Xóa toàn bộ dữ liệu
   */
  clearAllData(): void {
    this.dataStore.clear();
  }
}
