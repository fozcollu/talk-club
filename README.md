[Agora.io](http://agora.io) ve react kullanılarak gerçek zamanlı sesli sohbet uygulaması

**WebRTC** → Google tarafından temelde peer-to-peer olarak gerçek zamanlı sesli ve görüntülü iletişimi ve data paylaşımını sağlayan açık kaynak kütüphanesi.

[https://codelabs.developers.google.com/codelabs/webrtc-web#0](https://codelabs.developers.google.com/codelabs/webrtc-web#0)

**RFC** → internet standartları ve protokolleri için teknik yayınlar diyebiliriz. Bu standartlar belirlendikten sonra üzerine teknolojiler geliştirildiği için değişmesi mümkün olmayan yeni talepler sonrasında yeni versiyonları çıkan dökümanlardır.

**IETF** (Internet Engineering Task Force) ‘de bu RFC sürecini yöneten ekibe verilen isim

[Agora.i](http://agora.il)o → WebRTC alternatifi. WebRTC biraz daha kompleks bir yapı. Sunucu ihtiyacın var. Hızlı bir çözüm için [agora.io](http://agora.io) gayet iyi

[https://www.agora.io/en/blog/past-present-future-of-webrtc/](https://www.agora.io/en/blog/past-present-future-of-webrtc/)

kullandığım apinin dökümantasyonu

[https://docs.agora.io/en/Voice/API Reference/web_ng/index.html](https://docs.agora.io/en/Voice/API%20Reference/web_ng/index.html)

1-) [Agora.io](http://agora.io) ücretsiz üyelik oluşturulur

2-) [Agora.io](http://agora.io) içerisinde yeni bir proje oluşturulur

3- ) npx create-react-app my-app --template typescript

4- ) npm install agora-web-sdk-ng

5-) Aşağıdaki gibi bir client oluşturulur

```jsx
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: 'live',
  codec: 'vp8'
});
```

6-) [Agora.io](http://agora.io) dan yeni bir kanal & token oluşturulur.
![image](https://user-images.githubusercontent.com/29051356/116880462-b928e100-ac2a-11eb-93f6-f6de0e08ad0e.png)
![image](https://user-images.githubusercontent.com/29051356/116880387-9bf41280-ac2a-11eb-8e58-69da48f4d528.png)


7-) AppId,channelName,token kullanararak oluşturduğumuz client ile channel'e katılalım

```jsx
const appid = 'a3ab4668bebb4ec7954cbdfb888ad7ac';
const channel = 'genel';
const token =
  '006a3ab4668bebb4ec7954cbdfb888ad7acIADLtRysPBLOBTi3EWjD3D/y71Ja9nRu2Unt46k5ZDUkt8oPD/8AAAAAEADr9jhXC/+OYAEAAQAK/45g';
await client.join(appid, channel, token || null, uid);
```

8-) Sesimizi kanala iletecek bir localTrack instance'ı oluşturup onu publish edelim.

```jsx
const microphoneTrack = await createLocalTracks();
await client.publish([microphoneTrack]);
```

9-) Kanaldan çıkmak için mikrofonumuzun sesimi almaması için micTrack durdururuz.

```jsx
localAudioTrack.stop();
localAudioTrack.close();

await client?.leave();
```

10-) Odadaki diğer kullanıcıları duyabilmemiz için onlara subscribe olmamaz gerekiyor. Kullanıcılar odaya girince "user-published" ve "user-joined" event fırlatırlar. Bizde useEffect içerisinde bunlara subs. olabiliriz. Aşağıda birtane event subs örneğini ekleyelim.

```jsx
useEffect(()=>{
function handleUserPublished(user: IAgoraRTCRemoteUser){
await client.subscribe(user, mediaType);
}
client.on('user-published', handleUserPublished);

return client.off('user-published', handleUserPublished)
},[])
```

Not: Remote User'ları track etmek için çeşitli eventler bulunuyor. Uygulamanızın ihtiyacına göre ilgili eventi dinleyebilir ona göre aksiyon alabilirsiniz. Mesela kullanıcıların mute-unmute olaylarını yakalamak istiyorsanız "user-info-updated" eventi dinleyebilirisiniz. Diğer eventler için [https://docs.agora.io/en/Voice/API Reference/web_ng/interfaces/iagorartcclient.html#subscribe](https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcclient.html#subscribe)

Not: Odadaki kullanıcıları client.remoteUsers 'dan görebilirsiniz.
