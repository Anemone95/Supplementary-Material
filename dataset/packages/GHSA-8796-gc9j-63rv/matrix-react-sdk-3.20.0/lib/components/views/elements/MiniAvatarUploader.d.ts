import React from 'react';
export declare const AVATAR_SIZE = 52;
interface IProps {
    hasAvatar: boolean;
    noAvatarLabel?: string;
    hasAvatarLabel?: string;
    setAvatarUrl(url: string): Promise<void>;
}
declare const MiniAvatarUploader: React.FC<IProps>;
export default MiniAvatarUploader;
