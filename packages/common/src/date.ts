import dayjs, {Dayjs} from 'dayjs'

export const toHumanDateAgo = (dateTimestamp: number): string => {
    const date: Dayjs = dayjs(dateTimestamp);
    const now = dayjs();

    const differenceInDays = now.diff(date, 'days');
    const differenceInWeeks = now.diff(date, 'week');
    const differenceInMonths = now.diff(date, 'months');
    const differenceInYears = now.diff(date, 'years');

    if (differenceInDays <= 0) {
        return 'Today';
    } else if (differenceInDays === 1) {
        return 'Yesterday';
    } else if (differenceInDays > 1 && differenceInWeeks <= 0) {
        return `${differenceInDays} days ago`;
    } else if (differenceInWeeks > 0 && differenceInMonths <= 0) {
        return `${differenceInWeeks} weeks ago`;
    } else if (differenceInMonths > 0 && differenceInYears <= 0) {
        return `${differenceInMonths} months ago`;
    } else if (differenceInYears > 0 && differenceInYears < 10) {
        return `${differenceInYears} years ago`;
    } else {
        // More than a decade...
        return 'Wow...'
    }
}