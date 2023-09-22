const weekday = ["일", "월", "화", "수", "목", "금", "토"];
const focusList = [];
const date = new Proxy(
  {
    year: dayjs().year(),
    month: dayjs().month() + 1,
  },
  {
    set(target, key, value) {
      // 정해진 키 이외의 다른 키는 수정 불가
      if (Object.keys(target).includes(key) === false) return false;

      let year = target.year;
      let month = target.month;

      if (key === "year") {
        year = value;

        // 연도 변경시 현재 연도 문구도 변경
        const nowMonth = document.getElementById("now-date");
        const monthText = month.toString().padStart(2, "0");
        nowMonth.textContent = `${year}년 ${monthText}월`;
      }

      if (key === "month") {
        // 월 변경시 1월 미만, 12월 초과인 경우 연도도 변경
        year += Math.floor(value / 12);
        month = value % 12;

        if (month === 0) {
          year -= 1;
          month = 12;
        }
        if (month === 13) {
          year += 1;
          month = 1;
        }

        // 월 변경시 이전 월, 현재 연월, 다음 월 문구도 변경
        const beforeMonth = document.getElementById("before-month");
        const nowMonth = document.getElementById("now-date");
        const afterMonth = document.getElementById("after-month");
        const monthText = month.toString().padStart(2, "0");
        beforeMonth.textContent = `${month - 1 === 0 ? 12 : month - 1}월`;
        nowMonth.textContent = `${year}년 ${monthText}월`;
        afterMonth.textContent = `${month + 1 === 13 ? 1 : month + 1}월`;
      }

      // 연도나 월의 변화가 생겼을 때, 적용 후 달력 업데이트
      if (year !== target.year || month !== target.month) {
        target.year = year;
        target.month = month;

        focusList.splice(0, focusList.length);
        drawCalendar();
        return true;
      }

      return false;
    },
    get(target, key) {
      return target[key];
    },
  }
);

window.addEventListener("DOMContentLoaded", function () {
  // 이전 월로 이동
  const beforeMonth = document.getElementById("before-month");
  beforeMonth.addEventListener("click", function () {
    date.month -= 1;
  });

  // 다음 월로 이동
  const afterMonth = document.getElementById("after-month");
  afterMonth.addEventListener("click", function () {
    date.month += 1;
  });

  // 오늘로 이동
  const nowDate = document.getElementById("now-date");
  nowDate.addEventListener("click", function () {
    date.year = dayjs().year();
    date.month = dayjs().month() + 1;
  });

  // 최초 달력 그리기
  drawCalendar();
});

/** 달력 그리기 */
function drawCalendar() {
  // 달력 아이템 생성
  const calendarItemList = getCalendarItemList(date.year, date.month);

  // 오늘 날짜 포커스 하기
  const today = dayjs();
  const nowYear = today.year();
  const nowMonth = today.month() + 1;
  const nowDay = today.date();

  if (nowYear === date.year && nowMonth === date.month) {
    const todayItemIndex = calendarItemList.findIndex(
      (item) => item === nowDay
    );
    focusList.push(todayItemIndex);
  }

  // 달력 그리기
  drawCalendarFromItemList(calendarItemList, focusList);
}

/** 달력 배열로 달력 그리기 */
function drawCalendarFromItemList(calendarItemList, focusItemList = []) {
  // 달력 래퍼
  const calendar = document.getElementById("calendar");

  // 기존 일자 제거
  calendar.replaceChildren();

  // 아이템 배열 돌려서 일자 하나하나 추가
  calendarItemList.forEach(function (day, index, array) {
    const dayElement = document.createElement("div");

    // 일요일은 빨간색 클래스 추가
    if (index % 7 === 0) {
      dayElement.classList.add("red");
    }
    // 토요일은 파란색 클래스 추가
    if (index % 7 === 6) {
      dayElement.classList.add("blue");
    }
    // 첫날은 첫날 클래스 추가
    if (day === 1) {
      dayElement.classList.add("start");
    }
    // 마지막날은 마지막날 클래스 추가
    if (day && (index === array.length - 1 || array[index + 1] === "")) {
      dayElement.classList.add("end");
    }
    // 첫날 전 빈칸 클래스 추가
    if (index < 7 && array[index + 1] === 1) {
      dayElement.classList.add("before-start");
    }
    // 마지막 날 다음 빈칸 클래스 추가
    if (array.length - index <= 7 && day === "" && array[index - 1] !== "") {
      dayElement.classList.add("after-end");
    }
    // 포커스된 아이템 클래스 추가
    if (focusItemList.includes(index)) {
      dayElement.classList.add("focus");
    }

    // 일자 표시
    dayElement.textContent = day;

    // 클릭시 포커스 배열에 추가
    if (day) {
      dayElement.addEventListener("click", function () {
        if (focusList.includes(index)) {
          const nowIndex = focusList.findIndex(
            (focusIndex) => focusIndex === index
          );
          focusList.splice(nowIndex, 1);
        } else {
          focusList.push(index);
        }
        drawCalendar();
      });
    }

    // 달력에 추가
    calendar.appendChild(dayElement);
  });
}

/** 해당 연월의 달력 배열 계산 */
function getCalendarItemList(year, month) {
  // 첫날 Dayjs
  const firstDate = dayjs([year, month, 1]);
  // 계산 월 마지막 일
  const lastDayInMonth = firstDate.daysInMonth();
  // 마지막날 Dayjs
  const lastDate = dayjs([year, month, lastDayInMonth]);

  // 첫날 요일
  const firstWeekday = firstDate.day();
  // 마지막날 요일
  const lastWeekday = lastDate.day();
  // 일자 칸 합산
  const fullDays = firstWeekday + lastDayInMonth;
  // 마지막 줄 빈 칸 추가
  const lastColAdder = fullDays % 7 > 0 ? 7 - (fullDays % 7) : 0;
  // 총 달력 칸 수
  const totalDayBluck = fullDays + lastColAdder;

  // 마지막 줄 번호
  const lastCol = Math.ceil(totalDayBluck / 7) - 1;

  // 달력 배열 (비어있는 날은 " ")
  const calendarList = Array.from(
    { length: totalDayBluck },
    function (_, index) {
      const col = Math.floor(index / 7);
      const row = index % 7;

      // 1일 이전은 빈칸
      if (col === 0 && row < firstWeekday) {
        return "";
      }
      // 마지막날 이후는 빈칸
      if (col === lastCol && row > lastWeekday) {
        return "";
      }

      // 현재 일자 표기
      return index + 1 - firstWeekday;
    }
  );

  return calendarList;
}
