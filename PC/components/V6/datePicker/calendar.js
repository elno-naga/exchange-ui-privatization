export default {
  // 当某月的天数
  getDaysInOneMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const d = new Date(year, month, 0);
    return d.getDate();
  },
  // 向前空几个
  getMonthweek(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const dateFirstOne = new Date(year, month, 1);
    return dateFirstOne.getDay() === 0 ? 0 : dateFirstOne.getDay();
  },
  // 获取当前日期上一年或者下一年
  getOtherYear(date, str = 'nextYear') {
    const { year, month, day } = this.dateFormat(date);

    let year2;
    if (str === 'nextYear') {
      year2 = parseInt(year, 0) + 1;
    } else {
      year2 = parseInt(year, 0) - 1;
    }
    return new Date(year2, month, day);
  },

  // 获取当前日期之后的几个月或者前几个月 默认都是一个月  str 为 nextMonth 或者preMonth  获取上一周或者下一周 length只能为1 类型nextWeek或者perWeek
  getOtherMonthOrWeek(date, str = 'nextMonth', length = 1) {
    const { year, month, day } = this.dateFormat(date);
    let year2 = year;
    let day2 = day;
    let month2 = month;
    const days2 = new Date(year2, month2, 0).getDate();

    if (str === 'nextMonth') {
      month2 = parseInt(month, 0) + length;
      if (month2 > 12) {
        year2 = parseInt(year2, 0) + parseInt(parseInt(month2, 0) / 12, 0);
        month2 %= 12;
      }
    } else if (str === 'preMonth') {
      month2 = parseInt(month, 0) - length;
      if (month2 <= 0) {
        year2 = parseInt(year2, 0) - 1 - (parseInt((length - parseInt(month, 0)) / 12, 0));
        month2 = 12 - ((length - parseInt(month, 0)) % 12);
      }
    } else if (str === 'nextWeek') {
      const weekDays = parseInt(day, 0) + 7;
      if (weekDays > days2) {
        month2 = parseInt(month, 0) + 1;
        if (month2 > 12) {
          year2 = parseInt(year2, 0) + parseInt(parseInt(month2, 0) / 12, 0);
          month2 %= 12;
        }
        day2 = weekDays % days2;
      } else {
        day2 = weekDays;
      }
    } else if (str === 'preWeek') {
      if ((day - 7) < 1) {
        month2 = parseInt(month, 0) - 1;
        if (month2 < 1) {
          year2 = parseInt(year2, 0) - 1;
          month2 = 12;
          day2 = day + days2 - 7;
        }
      } else {
        day2 = day - 7;
      }
    }

    if (day2 > days2) {
      day2 = days2;
    }

    return new Date(year2, month2, day2);
  },
  // 上个月末尾的一些日期
  getLeftArr(date) {
    const arr = [];
    const leftNum = this.getMonthweek(date) % 7;
    const num = this.getDaysInOneMonth(this.getOtherMonthOrWeek(date, 'preMonth'))
      - leftNum
      + 1;

    const preDate = this.getOtherMonthOrWeek(date, 'preMonth');
    // 上个月多少开始
    for (let i = 0; i < leftNum; i += 1) {
      const nowTime = preDate.getTime();
      arr.push({
        id: num + i,
        date: nowTime,
        isToday: false,
        otherMonth: 'preMonth',
      });
    }
    return arr;
  },
  // 下个月末尾的一些日期
  getRightArr(date) {
    const arr = [];
    const nextDate = this.getOtherMonthOrWeek(date, 'nextMonth');
    const leftLength = this.getDaysInOneMonth(date) + this.getMonthweek(date);
    const CleftLength = leftLength % 7;
    const lineLength = leftLength / 7;
    const Nlength = lineLength < 5 ? 14 - CleftLength : 7 - CleftLength;
    for (let i = 0; i < Nlength; i += 1) {
      const nowTime = nextDate.getTime();
      arr.push({
        id: i + 1,
        date: nowTime,
        isToday: false,
        otherMonth: 'nextMonth',
      });
    }
    return arr;
  },
  // format日期
  dateFormat(date) {
    let year = '';
    let month = '';
    let day = '';
    let timeStamp = '';
    if (date) {
      let Ndate = date;

      if (typeof date === 'string') {
        Ndate = new Date(date.replace('-', '/'));
      } else if (typeof date === 'number') {
        Ndate = new Date(date);
      }

      year = Ndate.getFullYear();
      month = Ndate.getMonth();
      day = Ndate.getDate();
      timeStamp = new Date(year, month, day).getTime();
    }

    return {
      timeStamp,
      year,
      month,
      day,
    };
  },
  dateToStr(date) {
    if (!date) return date;

    let Ndate = date;

    if (typeof date === 'string') {
      Ndate = new Date(date.replace('-', '/'));
    } else if (typeof date === 'number') {
      Ndate = new Date(date);
    }

    return `${Ndate.getFullYear()}-${(Ndate.getMonth() + 1).toString().padStart(2, 0)}-${Ndate.getDate().toString().padStart(2, 0)}`;
  },
  // 获取某月的列表不包括上月和下月
  getMonthListNoOther(date) {
    const arr = [];
    const num = this.getDaysInOneMonth(date);
    const { year, month, timeStamp } = this.dateFormat(date);
    const toDay = timeStamp;

    for (let i = 0; i < num; i += 1) {
      const nowTime = new Date(year, month, i + 1).getTime();
      arr.push({
        id: i + 1,
        date: nowTime,
        isToday: toDay === nowTime,
        otherMonth: 'nowMonth',
      });
    }
    return arr;
  },
  // 获取某月的列表 用于渲染
  getMonthList(date) {
    return [
      ...this.getLeftArr(date),
      ...this.getMonthListNoOther(date),
      ...this.getRightArr(date),
    ];
  },
  // 开始时间
  formatStartTime(time) {
    const { year, month, day } = this.dateFormat(time);
    return new Date(year, month, day, 0, 0, 0, 0).getTime();
  },
  // 结束时间
  formatEndTime(time) {
    const { year, month, day } = this.dateFormat(time);
    return new Date(year, month, day, 23, 59, 59, 999).getTime();
  },
};
