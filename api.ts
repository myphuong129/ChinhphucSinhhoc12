
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVDYiikx8V8s4-JBAdlS47glBjIOyqEFYZ_KFZHNfIK4oGgEARtPJaxXJ4mLAUiBPeTg/exec'.trim();

/**
 * Hàm thực hiện yêu cầu API tới Google Apps Script.
 * KHÔNG đặt Header 'Content-Type' là 'application/json' để tránh lỗi CORS Preflight (yêu cầu OPTIONS).
 * Apps Script không hỗ trợ OPTIONS request tốt.
 */
async function request(action: string, payload: any = {}) {
  try {
    // Sử dụng fetch với cấu hình tối ưu cho Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow', // Quan trọng: GAS luôn trả về redirect 302
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    throw new Error('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại URL Script hoặc đảm bảo Script đã được Deploy ở chế độ "Anyone".');
  }
}

export const api = {
  login: (account: string, password: string) => request('login', { account, password }),
  logout: (account: string) => request('logout', { account }),
  getLessons: (account: string) => request('getLessons', { account }),
  getQuestions: (lessonId: number) => request('getQuestions', { lessonId }),
  submitResult: (result: any) => request('submitResult', result),
};
