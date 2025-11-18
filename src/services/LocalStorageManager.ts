/**
 * LocalStorageManager
 *
 * 브라우저 localStorage를 사용하여 월드 데이터를 저장/로드하는 클래스
 *
 * Responsibilities:
 * - SerializedWorld 데이터를 localStorage에 저장
 * - localStorage에서 SerializedWorld 데이터 로드
 * - 저장된 데이터 존재 여부 확인
 * - 저장된 데이터 삭제
 * - 저장 용량 확인
 *
 * Design Principles:
 * - Single Responsibility: 저장소 관리만 담당
 * - Graceful Degradation: 에러 시 null 반환 (throwing 안 함)
 * - Browser Compatibility: localStorage API 사용
 */

import type { SerializedWorld } from '../types/SerializationTypes';

export class LocalStorageManager {
  /** localStorage 키 이름 */
  private static readonly STORAGE_KEY = 'cubeworld_save';

  /**
   * 월드 데이터를 localStorage에 저장
   *
   * @param data - 저장할 SerializedWorld 데이터
   * @returns 성공 여부 (true: 성공, false: 실패)
   */
  saveWorld(data: SerializedWorld): boolean {
    try {
      const jsonString = JSON.stringify(data);
      localStorage.setItem(LocalStorageManager.STORAGE_KEY, jsonString);
      return true;
    } catch (error) {
      // localStorage quota exceeded 또는 기타 에러
      console.error('Failed to save world to localStorage:', error);
      return false;
    }
  }

  /**
   * localStorage에서 월드 데이터 로드
   *
   * @returns 저장된 SerializedWorld 데이터, 없으면 null
   */
  loadWorld(): SerializedWorld | null {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return null;
      }

      const data = JSON.parse(jsonString) as SerializedWorld;
      return data;
    } catch (error) {
      // JSON 파싱 에러 또는 데이터 손상
      console.error('Failed to load world from localStorage:', error);
      return null;
    }
  }

  /**
   * 저장된 월드가 있는지 확인
   *
   * @returns 저장된 데이터가 있고 유효하면 true, 없거나 손상되었으면 false
   */
  hasWorld(): boolean {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return false;
      }

      // 데이터 유효성 간단 체크 (JSON 파싱 가능한지)
      JSON.parse(jsonString);
      return true;
    } catch {
      // 파싱 실패 = 손상된 데이터 = 유효한 저장 없음
      return false;
    }
  }

  /**
   * 저장된 월드 데이터 삭제
   */
  clearWorld(): void {
    try {
      localStorage.removeItem(LocalStorageManager.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear world from localStorage:', error);
    }
  }

  /**
   * 저장된 데이터의 크기 확인 (bytes)
   *
   * @returns 저장된 데이터 크기 (bytes), 없으면 0
   */
  getSaveSize(): number {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return 0;
      }

      // JavaScript string의 byte 크기 계산
      // UTF-16 인코딩을 고려 (각 문자는 2 bytes)
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }
}
