import { useState, useEffect } from 'react';
import { IRemoteUser } from './../types';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  MicrophoneAudioTrackInitConfig,
  CameraVideoTrackInitConfig,
  IMicrophoneAudioTrack,
  ILocalAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

export default function useAgora(
  client: (IAgoraRTCClient & { remoteUsers: IRemoteUser[] }) | undefined
): {
  localAudioTrack: ILocalAudioTrack | undefined;
  joinState: boolean;
  leave: Function;
  join: Function;
  remoteUsers: IRemoteUser[];
} {
  const [localAudioTrack, setLocalAudioTrack] = useState<
    ILocalAudioTrack | undefined
  >(undefined);

  const [joinState, setJoinState] = useState(false);

  const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);

  async function createLocalTracks(
    audioConfig?: MicrophoneAudioTrackInitConfig,
    videoConfig?: CameraVideoTrackInitConfig
  ): Promise<IMicrophoneAudioTrack> {
    const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack(
      audioConfig
    );
    setLocalAudioTrack(microphoneTrack);

    return microphoneTrack;
  }

  /**
   * create a local audio track and publish
   *
   */
  async function join(uid?: string) {
    if (!client) return;
    const appid = 'a3ab4668bebb4ec7954cbdfb888ad7ac';
    const channel = 'genel';
    const token =
    '006a3ab4668bebb4ec7954cbdfb888ad7acIADLtRysPBLOBTi3EWjD3D/y71Ja9nRu2Unt46k5ZDUkt8oPD/8AAAAAEADr9jhXC/+OYAEAAQAK/45g';
    await client.join(appid, channel, token || null, uid);
    const microphoneTrack = await createLocalTracks();
    await client.publish([microphoneTrack]);

    (window as any).client = client;

    setJoinState(true);
  }

  /**
   * audioTrack close&stop
   */
  async function leave() {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }

    setRemoteUsers([]);
    setJoinState(false);
    await client?.leave();
  }

  /**
   * Subscribe remote users events
   */
  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);


    //for re-render
    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client.subscribe(user, mediaType);     
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {      
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {   
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserInfoUpdate = (
      userUid: UID,
      msg: 'mute-audio' | 'unmute-audio'
    ) => {
      const index = remoteUsers.findIndex((x) => x.uid === userUid);
      if (index === -1) return;

      const updatedRemoteUsers = [...remoteUsers];
      updatedRemoteUsers[index].isMuted = msg === 'mute-audio' ? true : false;

      setRemoteUsers(updatedRemoteUsers);
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);
    client.on('user-info-updated', handleUserInfoUpdate);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
      client.off('user-info-updated', handleUserInfoUpdate);
    };
  }, [client, remoteUsers]);

  return {
    localAudioTrack,
    joinState,
    leave,
    join,
    remoteUsers
  };
}
