var moment =require('moment');

function formatMessage(username,text,index) {
    return {
        username,
        text,
        index,
        date: moment().format('h:mm a')
    }
}

module.exports = formatMessage;
