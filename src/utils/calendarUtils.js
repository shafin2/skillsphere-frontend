/**
 * Google Calendar Integration Utilities
 * Generates links for adding events to Google Calendar and downloading .ics files
 */

export const generateGoogleCalendarLink = ({
  title,
  startTime,
  endTime,
  description = '',
  location = ''
}) => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const params = new URLSearchParams({
    text: title,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
    details: description,
    location: location
  })
  
  return `${baseUrl}&${params.toString()}`
}

export const generateICSFile = ({
  title,
  startTime,
  endTime,
  description = '',
  location = ''
}) => {
  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const now = new Date()
  const uid = `${now.getTime()}@skillsphere.com`
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkillSphere//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  return icsContent
}

export const downloadICSFile = (icsContent, filename = 'event.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export const generateBookingCalendarEvent = (booking, isConfirmed = false) => {
  const { mentorId, learnerId, date, time, message } = booking
  const mentorName = mentorId?.fullName || 'Mentor'
  const learnerName = learnerId?.fullName || 'Learner'
  
  // Create start and end times
  const [hours, minutes] = time.split(':')
  const startTime = new Date(date)
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const endTime = new Date(startTime)
  endTime.setHours(startTime.getHours() + 1) // 1-hour sessions
  
  const title = `Mentoring Session: ${mentorName} & ${learnerName}`
  const description = [
    `Mentoring session between ${mentorName} and ${learnerName}`,
    '',
    message ? `Session focus: ${message}` : '',
    '',
    isConfirmed ? '✅ Confirmed' : '⏳ Pending confirmation',
    '',
    'Join link will be provided before the session.'
  ].filter(Boolean).join('\n')
  
  return {
    title,
    startTime,
    endTime,
    description,
    location: 'Online (link will be provided)'
  }
}
