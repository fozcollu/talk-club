import React from 'react';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import useAgora from './hooks/useAgora';

import './Call.css';
import { ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import MuteSvg from './icons/mute.svg';
import { IRemoteUser } from './types';

const client = AgoraRTC.createClient({ codec: 'h264', mode: 'rtc' });

function Call() {
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [localIsMuted, setLocalIsMuted] = React.useState<boolean>(false);
  const { localAudioTrack, leave, join, joinState, remoteUsers } = useAgora(
    client as IAgoraRTCClient & { remoteUsers: IRemoteUser[] }
  );

  React.useEffect(() => {
    localAudioTrack?.play();
    console.log('effect -> ', localAudioTrack);
    return () => {
      localAudioTrack?.stop();
    };
  }, [localAudioTrack]);

  function toggleLocalTrackSetEnabled() {
    localAudioTrack?.setEnabled(localIsMuted ? true : false);
    setLocalIsMuted(!localIsMuted);
  }

  return (
    <div className="call">
      {client?.connectionState !== 'CONNECTED' && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <div className="button-group">
        <button
          id="join"
          type="button"
          className="btn btn-primary btn-sm"
          disabled={joinState || !name}
          onClick={() => {
            join(name);
          }}
        >
          Join
        </button>
        <button
          id="leave"
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!joinState}
          onClick={() => {
            leave();
          }}
        >
          Leave
        </button>
      </div>
      <div>
        {/* LOCAL */}
        {client?.connectionState === 'CONNECTED' ? (
          <div style={{ textAlign: 'center' }}>
            <h1>Me</h1>

            <UserCall
              isMuted={localIsMuted}
              audioTrack={localAudioTrack}
              toggleLocalTrackSetEnabled={toggleLocalTrackSetEnabled}
              name={client.uid as string}
            />
          </div>
        ) : null}

        {/* user list */}
        {remoteUsers.length > 0 && (
          <div
            style={{ marginTop: 10, padding: 10, borderTop: '1px solid #eee' }}
          >
            <h1>Users</h1>
            {remoteUsers.map((user, index) => (
              <span
                style={{
                  marginRight:
                    remoteUsers.length !== index + 1 && remoteUsers.length > 0
                      ? 5
                      : 0
                }}
              >
                <UserCall
                  key={user.uid}
                  audioTrack={user.audioTrack}
                  name={user.uid as string}
                  isMuted={user.isMuted}
                />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCall({
  audioTrack,
  toggleLocalTrackSetEnabled,
  name,
  isMuted
}: {
  audioTrack?: ILocalAudioTrack | IRemoteAudioTrack | undefined;
  toggleLocalTrackSetEnabled?: () => void;
  name: string;
  isMuted: boolean;
}) {
  const [isTalking, setIsTalking] = React.useState(false);

  React.useEffect(() => {
    audioTrack?.play();

    return audioTrack?.stop();
  }, [audioTrack]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const talking = (audioTrack?.getVolumeLevel() || 0) > 0.01 ? true : false;
      setIsTalking(talking);
    }, 50);
    return () => clearInterval(interval);
  }, [audioTrack]);

  return (
    <>
      <span
        style={{
          backgroundColor: isMuted ? '#d9d9d9' : 'orange',
          border: isTalking ? '3px solid green' : 'unset'
        }}
        className="call-user"
        onClick={
          toggleLocalTrackSetEnabled
            ? () => {
                toggleLocalTrackSetEnabled();
              }
            : undefined
        }
      >
        <h2>{name}</h2>
        {isMuted && <img src={MuteSvg} width={20} alt="React Logo" />}
      </span>
    </>
  );
}

export default Call;
