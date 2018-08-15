// const ajax = function({uri, callback}) {
//   const x = new XMLHttpRequest();
//   x.addEventListener('load', () => {
//     const data = JSON.parse(x.response);
//     callback(data);
//   })
//   x.open('GET', uri);
//   x.send();
// }

/*const ajax = function({uri, callback}) {
  const dummyData = {
    createdAt: "2018-08-14 08:02:13",
    commitList: [{message: 'fix: bug fix'}, {message: 'feat: add some feature'}]
  }
  callback(dummyData);
}*/

const ajax = function({uri, callback}) {
  const dummyData = {
    createdAt: "2018-08-13 15:02:13",
    commitList: [{message: 'fix: bug fix'}, {message: 'feat: add some feature'}]
  }
  callback(dummyData);
}

const template = function(message) {
  return `<li class='commit_list_item'>${message}</li>`;
}

// @param {number} month - 0 ~ 11
const dayCalculator = function({month, date}) {
  const map = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let result = 0;

  for(let i = 0; i <= month; i++) {
    result += map[i];
  }

  return result + date-1;
}

class DateCalculator {
  constructor({lastCommitTimeMessageElem, restTimeElem, commitListWrapElem, uri, ajax, dayCalculator, template}) {
    this.elLastCommitTimeMessage = lastCommitTimeMessageElem;
    this.elRestTime = restTimeElem;
    this.elCommitListWrap = commitListWrapElem;
    this.uri = uri;
    this.ajax = ajax
    this.dayCalculator = dayCalculator;
    this.template = template;
    this.restTime = null;
    this.lastCommitDate = null;
    this.setTimeoutID = null;
  }

  start() {
    clearTimeout(this.setTimeoutID);
    this.ajax({uri: this.uri, callback: this.set.bind(this)});
  }

  set(ajaxData) {
    this.lastCommitDate = new Date(ajaxData.createdAt);
    const commitList = ajaxData.commitList;

    this.setLastCommitTime(this.lastCommitDate);
    this.setRestTime({lastCommitDate: this.lastCommitDate});
    this.renderCommitList(commitList);
  }

  setLastCommitTime(lastCommitDate) {
    const currentTime = new Date().getTime();
    const lastCommitTime = lastCommitDate.getTime();
    let message = '';

    if(!lastCommitTime) {
      message = '커밋이 존재하지 않습니다';
    }

    else {
      const passedTime = new Date(currentTime - lastCommitTime - 32400000);

      const passedTimeMonth = passedTime.getMonth();
      const passedTimeDate = passedTime.getDate();
      const passedTimeHours = passedTime.getHours();
      const passedTimeMinutes = passedTime.getMinutes();
      const passedTimeSeconds = passedTime.getSeconds();
      
      const passedDays = this.dayCalculator({month: passedTimeMonth, date: passedTimeDate});

      const passedDaysString = passedDays ? `${passedDays}일 ` : '';
      const passedHoursString = passedTimeHours ? `${passedTimeHours}시간 ` : '';

      const passedTimeMessage = passedDaysString + passedHoursString + `${passedTimeMinutes}분`;

      message = '마지막 커밋으로부터 <span class="text_highlight">' + passedTimeMessage + '</span> 지났습니다';
    }

    this.elLastCommitTimeMessage.innerHTML = message;
  }

  setRestTime({lastCommitDate}) {
    const currentDate = new Date();

    let restHours = 0;
    let restMinutes = 0;
    let restSeconds = 0;

    if(!this.hasTodayCommit({currentDate, lastCommitDate})) {
      restHours = 23 - currentDate.getHours();
      restMinutes = 59 - currentDate.getMinutes();
      restSeconds = 59 - currentDate.getSeconds();
    }

    this.restTime = {hours: restHours, minutes: restMinutes, seconds: restSeconds};

    this.renderRestTime(this.restTime);
  }

  hasTodayCommit({currentDate, lastCommitDate}) {
    return lastCommitDate.getFullYear() === currentDate.getFullYear()
     && lastCommitDate.getMonth() === currentDate.getMonth()
     && lastCommitDate.getDate() === currentDate.getDate();
  }
  
  // @parma {Object} timedata - {hours, minutes, seconds}
  renderRestTime(timedata) {
    let hours = timedata.hours.toString();
    let minutes = timedata.minutes.toString();
    let seconds = timedata.seconds.toString();

    hours = hours.padStart(2,'0');
    minutes = minutes.padStart(2,'0');
    seconds = seconds.padStart(2,'0');

    this.elRestTime.textContent = hours === '00' && minutes === '00' && seconds === '00' ? '완료' : `${hours}:${minutes}:${seconds}`;
    
    this.setTimeoutID = setTimeout(this.setRestTime.bind(this, {lastCommitDate: this.lastCommitDate}), 1000);
  }

  renderCommitList(commitList) {
    if(commitList.length === 0) return;
    else this.elCommitListWrap.innerHTML = '<ul class="commit_list">'
     + commitList.reduce((html, commit) => html += this.template(commit.message), '')
     + '</ul>';
  }
}


const dateCalculator = new DateCalculator({
  lastCommitTimeMessageElem: document.querySelector('.last_commit_time_message'),
  restTimeElem: document.querySelector('.rest_time'),
  commitListWrapElem: document.querySelector('.commit_list_wrap'),
    login: document.getElementById("login"),
    uri: 'http://13.209.88.99/api/commit/recent?login='+login.value,
    /*uri: 'http://localhost/api/commit/recent?login='+login.value,*/
  ajax: ajax,
  dayCalculator: dayCalculator,
  template: template
})

dateCalculator.start();