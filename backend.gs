
const SCRIPT_URL_ID = '144utjdYwkISRjzRZ2hngwCLyzzoGfIrmxjF6zInh6xM'; // SPREADSHEET_ID

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
      if (body.data) body = JSON.parse(body.data);
    }

    if (!body || !body.action) {
      return createJsonResponse({ success: false, message: "Thiếu hành động yêu cầu." });
    }

    const ss = SpreadsheetApp.openById(SCRIPT_URL_ID);
    const action = body.action;
    let result;

    switch (action) {
      case 'login':
        result = handleLogin(ss, body.account, body.password);
        break;
      case 'logout':
        result = handleLogout(ss, body.account);
        break;
      case 'getLessons':
        result = getLessonsData(ss, body.account);
        break;
      case 'getQuestions':
        result = getQuestionsByLesson(ss, body.lessonId);
        break;
      case 'submitResult':
        result = saveResult(ss, body);
        break;
      default:
        result = { success: false, message: "Hành động không xác định: " + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ 
      success: false, 
      message: "Lỗi hệ thống: " + err.toString(),
      details: "Đảm bảo Script đã được cấp quyền truy cập Spreadsheet."
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Các hàm handleLogin, handleLogout, getLessonsData, getQuestionsByLesson, saveResult giữ nguyên như file cũ của bạn nhưng đảm bảo hoạt động trong try-catch
function handleLogin(ss, account, password) {
  const sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: "Không tìm thấy bảng 'Users'" };
  const data = sheet.getDataRange().getValues();
  const accStr = String(account).trim();
  const passStr = String(password).trim();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === accStr && String(data[i][6]).trim() === passStr) {
      if (String(data[i][7]).trim().toUpperCase() === 'OFF') return { success: false, message: "Account đã bị khóa" };
      sheet.getRange(i + 1, 5).setValue('ON');
      return {
        success: true,
        user: { account: data[i][0], name: data[i][1], class: String(data[i][2]), email: data[i][3], role: data[i][5], progress: 'ON', active: data[i][7] }
      };
    }
  }
  return { success: false, message: "Tài khoản hoặc mật khẩu không chính xác." };
}

function handleLogout(ss, account) {
  const sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false };
  const data = sheet.getDataRange().getValues();
  const accStr = String(account).trim();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === accStr) {
      sheet.getRange(i + 1, 5).setValue('OFF');
      return { success: true };
    }
  }
  return { success: false };
}

function getLessonsData(ss, account) {
  const userSheet = ss.getSheetByName('Users');
  const lessonSheet = ss.getSheetByName('Lessons');
  const resultSheet = ss.getSheetByName('Results');
  if (!userSheet || !lessonSheet) return { success: false, message: "Thiếu bảng dữ liệu." };
  const userData = userSheet.getDataRange().getValues();
  let userFullName = "";
  for(let i=1; i<userData.length; i++) {
    if(String(userData[i][0]).trim() === String(account).trim()) {
      userFullName = userData[i][1];
      break;
    }
  }
  const lessonValues = lessonSheet.getDataRange().getValues();
  const resultValues = resultSheet ? resultSheet.getDataRange().getValues() : [];
  const lessons = [];
  let lastPassed = true;
  for (let i = 1; i < lessonValues.length; i++) {
    const lessonName = lessonValues[i][1];
    if (!lessonName) continue;
    let status = 'None';
    for(let j=1; j<resultValues.length; j++) {
      if(resultValues[j][1] === userFullName && resultValues[j][3] === lessonName) {
        if(resultValues[j][7] === 'Pass') status = 'Pass';
        else if(status !== 'Pass') status = 'Fail';
      }
    }
    lessons.push({
      stt: lessonValues[i][0], name: lessonName, title: lessonValues[i][2],
      count: lessonValues[i][3], timeout: lessonValues[i][4],
      targetScore: lessonValues[i][5], isLocked: !lastPassed, status: status
    });
    if (status !== 'Pass') lastPassed = false;
  }
  return { success: true, lessons };
}

function getQuestionsByLesson(ss, lessonId) {
  const sheet = ss.getSheetByName('Questions');
  if (!sheet) return { success: false, message: "Không tìm thấy bảng 'Questions'" };
  const data = sheet.getDataRange().getValues();
  const questions = [];
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][1]) === Number(lessonId)) {
      questions.push({
        stt: data[i][0], lesson_id: data[i][1], question_type: data[i][2],
        quiz_level: data[i][3], point: data[i][4], question_text: data[i][5],
        image_id: data[i][6], option_A: data[i][7], option_B: data[i][8],
        option_C: data[i][9], option_D: data[i][10], answer_key: String(data[i][11]), solution: data[i][12]
      });
    }
  }
  return { success: true, questions };
}

function saveResult(ss, res) {
  let sheet = ss.getSheetByName('Results');
  if (!sheet) {
    sheet = ss.insertSheet('Results');
    sheet.appendRow(['result_id', 'name', 'role', 'lesson_name', 'grade', 'score', 'total_questions', 'status', 'time_spent', 'timestamp', 'answers']);
  }
  const resultId = Utilities.getUuid();
  sheet.appendRow([resultId, res.name, res.role, res.lesson_name, res.grade ? "'" + res.grade : "", res.score, res.total_questions, res.status, res.time_spent, new Date(), res.answers]);
  return { success: true, resultId };
}
