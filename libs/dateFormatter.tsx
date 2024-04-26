type Props = {
    format: string;
    date: string | undefined
}

const dateFormatter = ({ format, date }: Props) => {
    switch (format) {
        case 'withHour':
            return date?.split(' ')[0].split('-').reverse().join('/') + ' ' + date?.split(' ')[1];
            break;
        case 'withNoHour':
            return date?.split(' ')[0].split('-').reverse().join('/');
            break;

        default:
            return date;
            break;
    }
}

export default dateFormatter;