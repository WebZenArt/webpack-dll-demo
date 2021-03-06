import React, {Component, PropTypes} from 'react';
import {Select, DatePicker} from 'antd';
import moment from 'moment';

const DAYTIMES = 86400000;

const DATEFORMAT = {
  startDay: 'YYYY-MM-DD 00:00:00',
  endDay: 'YYYY-MM-DD 23:00:00',
  year: 'YYYY',
  month: 'YYYY-MM',
  day: 'YYYY-MM-DD',
  quarter: 'YYYY-Q',
  quarterString: 'YYYY年Q季度'
};

const {Option} = Select;

const {MonthPicker, RangePicker} = DatePicker;

class DateFilter extends Component {

  constructor(arg) {
    super(...arg);
    this.state = {
      selectedValue: [],
      datePickerType: 'day',
    };
  }

  handleSelectChange(type) {
    const {onChange} = this.props;
    this.setState({
      datePickerType: type
    });
    const defaultValue = this.createDefaultValue(type);
    const data = this.selectedValueToArray(type, defaultValue);
    onChange({
      type,
      data
    });
  }

  handleDatePickerChange(date, dateString, type) {
    const {onChange} = this.props;
    let data = [];
    if (date) {
      this.setState({
        selectedValue: date
      });
      data = this.selectedValueToArray(type, date);
    }
    onChange({
      type,
      data
    });
  }

  handleRangePickerChange(date, dateString, type) {
    const {onChange} = this.props;
    let data = [];
    if (Array.isArray(date) && date.length > 0) {
      this.setState({
        selectedValue: date
      });
      data = this.selectedValueToArray(type, date);
    }
    onChange({
      type,
      data
    });
  }

  makeDayPicker(value) {
    const disabledDay = (current) => current && current.valueOf() > Date.now() - DAYTIMES;
    const {defaultValue} = this.props;
    // 日数据
    const dayPicker = (
      <DatePicker
        defaultValue={ defaultValue && value }
        placeholder="日数据"
        disabledDate={disabledDay}
        onChange={(date, dateString) => this.handleDatePickerChange(date, dateString, 'day')}/>
    );
    return dayPicker;
  }

  makeWeekPicker(defaultValue) {

    function disabledWeek(current) {
      const isFarDate = current.valueOf() > Date.now() - DAYTIMES;
      const isPreDte = current.valueOf() < Date.now() - 8 * DAYTIMES;
      let result = false;
      if(isPreDte || isFarDate) {
        result = true;
      }
      return result;
    }

    // 周数据
    const weekPicker = (
      <RangePicker
        defaultValue={defaultValue}
        disabledDate={disabledWeek}
        ranges={{'This Week': defaultValue}}
        onChange={(date, dateString) => this.handleRangePickerChange(date, dateString, 'week')}
      />
    );
    return weekPicker;
  }

  makeMonthPicker(defaultValue) {
    const disabledMonth = (current) => current && current.valueOf() > Date.now();
    // 月数据
    const weekPicker = (
      <MonthPicker
        defaultValue={defaultValue}
        disabledDate={disabledMonth}
        placeholder="月数据"
        onChange={(date, dateString) => this.handleDatePickerChange(date, dateString, 'month')}
      />
    );
    return weekPicker;
  }

  makeQuarterPicker(defaultValue) {
    // 季数据
    const quarter = DATEFORMAT.quarter;
    const quarterString = DATEFORMAT.quarterString;

    const quarterPicker = (
      <Select defaultValue={defaultValue[0].format(quarter)}
              style={{width: 120}}
              onChange={(date, dateString) => this.handleDatePickerChange(date, dateString = null, 'quarter')}>
        <Option value={defaultValue[0].format(quarter)}>{defaultValue[0].format(quarterString)}</Option>
        <Option value={defaultValue[1].format(quarter)}>{defaultValue[1].format(quarterString)}</Option>
        <Option value={defaultValue[2].format(quarter)}>{defaultValue[2].format(quarterString)}</Option>
        <Option value={defaultValue[3].format(quarter)}>{defaultValue[3].format(quarterString)}</Option>
      </Select>
    );
    return quarterPicker;
  }

  makeCustomPicker(defaultValue) {
    //自定义过滤
    const disabledWeek = (current) => current && current.valueOf() > Date.now() - DAYTIMES;
    // 周数据
    const customPicker = (
      <RangePicker
        defaultValue={defaultValue}
        disabledDate={disabledWeek}
        onChange={(date, dateString) => this.handleRangePickerChange(date, dateString, 'custom')}
      />
    );
    return customPicker;
  }

  createDefaultValue(type) {
    const defaultValue = {
      day: moment().subtract(1, 'days'),
      week: [moment().subtract(8, 'days'), moment().subtract(1, 'days')],
      month: moment(),
      quarter: [moment(), moment().subtract(1, 'quarter'), moment().subtract(2, 'quarter'), moment().subtract(3, 'quarter')],
      custom: [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
    }
    return defaultValue[type];
  }

  parseQuarterDate(date) {
    let dateString = '';
    if (Array.isArray(date)) {
      dateString = date[0].format(DATEFORMAT.quarter);
    } else {
      dateString = date;
    }
    const quarterArray = dateString.split('-');
    const year = quarterArray[0];
    const quarter = quarterArray[1];
    const monthArea = {
      1: [`${year}-01-01 00:00:00`, `${year}-03-31 23:00:00`],
      2: [`${year}-04-01 00:00:00`, `${year}-06-30 23:00:00`],
      3: [`${year}-07-01 00:00:00`, `${year}-09-30 23:00:00`],
      4: [`${year}-10-01 00:00:00`, `${year}-12-31 23:00:00`]
    };
    return monthArea[quarter];
  }

  getLastDay() {
    return moment().subtract(1, 'days');
  }

  selectedValueToArray(type, value) {
    let resultArray = [];
    if (type === 'day') {
      resultArray = [value.format(DATEFORMAT.startDay), value.format(DATEFORMAT.endDay)];
    } else if (type === 'week') {
      resultArray = [value[0].format(DATEFORMAT.startDay), value[1].format(DATEFORMAT.endDay)];
    } else if (type === 'month') {
      let endDay = moment(value.format(DATEFORMAT.month)).endOf('month').format(DATEFORMAT.endDay)
      // 如果选择为当月, 则选择结束为本月当天
      if (value.year() === moment().year() && value.month() === moment().month()) {
        endDay = this.getLastDay().format(DATEFORMAT.endDay);
      }
      resultArray = [moment(value.format(DATEFORMAT.month)).startOf('month').format(DATEFORMAT.startDay), endDay];
    } else if (type === 'quarter') {
      resultArray = this.parseQuarterDate(value);
    } else if (type === 'custom') {
      resultArray = [value[0].format(DATEFORMAT.startDay), value[1].format(DATEFORMAT.endDay)];
    }
    return resultArray;
  }

  renderDatePicker(type) {
    let result = null;
    const defaultValue = this.createDefaultValue(type);
    if (type === 'day') {
      result = this.makeDayPicker(defaultValue);
    } else if (type === 'week') {
      result = this.makeWeekPicker(defaultValue)
    } else if (type === 'month') {
      result = this.makeMonthPicker(defaultValue)
    } else if (type === 'quarter') {
      result = this.makeQuarterPicker(defaultValue)
    } else {
      result = this.makeCustomPicker(defaultValue)
    }
    return result;
  }

  render() {
    return (
      <div>
        <Select
          defaultValue="day"
          onChange={(e) => this.handleSelectChange(e)}
          style={{width: 80, marginRight: 10}}>
          <Option value="day">日数据</Option>
          <Option value="week">周数据</Option>
          <Option value="month">月数据</Option>
          <Option value="quarter">季数据</Option>
          <Option value="custom">自定义</Option>
        </Select>
        <span/>
        {this.renderDatePicker(this.state.datePickerType)}
      </div>
    );
  }
}

DateFilter.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.any
};

export default DateFilter;
