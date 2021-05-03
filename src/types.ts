import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

export interface IRemoteUser extends IAgoraRTCRemoteUser {
  isMuted: boolean;
}
