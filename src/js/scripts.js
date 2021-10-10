// Imports
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import iCalendarPlugin from '@fullcalendar/icalendar';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';

// Globals
const calendarEl = document.createElement('div');
let haltUpdates = null;

// Check the current status

function checkCalendarStatus(event) {
	// Check if an event is happening now
	const currentTime = moment().add(5, 'minutes');
	const status = document.getElementById('status');
	const description = document.getElementById('status-description');
	const caseInsensitiveTitle = event.title.toLowerCase();

	if (haltUpdates === true) {
		return;
	}

	if (currentTime.isBetween(event.start, event.end)) {
		let nextAvailable = moment(event.end);
		let beforeTomorrow = false;

		if (nextAvailable.isBefore(moment().startOf('day').add(1, 'day'))) {
			beforeTomorrow = true;
		}

		if (nextAvailable.isSameOrAfter(moment('5:00 PM', 'h:mm A')) && beforeTomorrow) {
			nextAvailable = 'tomorrow';
		}

		if (caseInsensitiveTitle.includes('vacation')) {
			status.innerText = 'Vacation';
			let beBackText = nextAvailable;

			if (beforeTomorrow === true && moment.isMoment(beBackText)) {
				beBackText = `around ${nextAvailable.format('h:mm a')}`;
			} else if (moment.isMoment(beBackText)) {
				beBackText = `on ${nextAvailable.format('dddd, MMM Do')}`;
			}

			description.innerText = `I'll be back ${beBackText}.`;
			haltUpdates = true;
		} else if (caseInsensitiveTitle.includes('private')) {
			status.innerText = 'Do not disturb';
			description.innerText = `I am either away from my keyboard, out of the office, or taking personal time. I will check email and Slack ${(nextAvailable === 'tomorrow') ? '' : 'around '} ${nextAvailable.format('h:mm a')}.`;
			haltUpdates = true;
		} else if (caseInsensitiveTitle.includes('travel')) {
			status.innerText = 'Traveling';
			description.innerText = 'I am traveling between meetings and will respond to you when I return.';
			haltUpdates = true;
		} else if (caseInsensitiveTitle.includes('focus')) {
			status.innerText = 'Focusing';
			description.innerText = `Please avoid interrupting me until ${nextAvailable.format('h:mm a')}.`;
		} else if (event.extendedProps.location.includes('zoom')) {
			status.innerText = 'On a Call';
			description.innerText = 'Slack me and I’ll get back to you.';
		} else if (event.extendedProps.location === null) {
			status.innerText = 'Away';
			description.innerText = 'I am away from my keyboard.';
		}
	}
}

// Create the schedule
const calendar = new Calendar(calendarEl, {
	plugins: [dayGridPlugin, iCalendarPlugin, timeGridPlugin],
	events: {
		url: 'https://outlook.office365.com/owa/calendar/1bc7c0cffeb1419ba90492d96b18fd7b@bu.edu/8465f8a2656748afb748eb8d2b5a431c1685887659296623380/calendar.ics',
		format: 'ics',
	},
	eventSourceSuccess() {
		calendar.render();
	},
	eventDidMount(rendered) {
		checkCalendarStatus(rendered.event);
	},
	eventDataTransform(eventData) {
		const newEventData = eventData;

		if (eventData.title.startsWith('Canceled: ')) {
			newEventData.className = 'is-canceled';
		}

		if (eventData.title.toLowerCase().includes('focus')) {
			newEventData.className = 'is-focused';
		}

		if (eventData.title.toLowerCase().includes('travel')) {
			newEventData.className = 'is-traveling';
		}

		return newEventData;
	},
	allDayContent() {
		return 'All day';
	},
	weekends: false,
	initialView: 'timeGridDay',
	slotMinTime: '09:00:00',
	slotMaxTime: '17:00:00',
	height: '600px',
	headerToolbar: false,
	expandRows: true,
	displayEventTime: false,
});

document.body.appendChild(calendarEl);
