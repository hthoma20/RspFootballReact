
import Strings from 'strings/en';

export function getLocalizedString(key: keyof typeof Strings): string {
    return Strings[key];
}
