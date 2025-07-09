export interface NavItemProps{
    name: string;
    src: string;
    to: string;
    selected?: string;
    onClick?: () => void;
}

 