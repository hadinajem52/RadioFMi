const radioStations = [
  // 🎶 Music & Entertainment
  {
    id: 1,
    name: 'Mix FM',
    url: 'https://25683.live.streamtheworld.com/MIXFM_LEBANONAAC_SC?dist=onlineradiobox',
    description: 'Top 40, Pop, R&B, Electronic',
    color: ['#FF6B6B', '#FF8E8E'],
    image: require('../radioimg/mixfm.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 2,
    name: 'Light FM',
    url: 'https://25603.live.streamtheworld.com/LIGHTFMAAC.aac?dist=onlineradiobox',
    description: 'Jazz, Blues, Rock, Pop, R&B, Lounge',
    color: ['#4ECDC4', '#44A08D'],
    image: require('../radioimg/lightfm.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 3,
    name: 'Radio Delta',
    url: 'http://s45.myradiostream.com:18408/;&type=mp3',
    description: 'Arabic Top 40, Adult Contemporary',
    color: ['#45B7D1', '#96C93D'],
    image: require('../radioimg/deltaradio.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 4,
    name: 'Sawt El Ghad',
    url: 'https://l3.itworkscdn.net/itwaudio/9030/stream',
    description: 'Top 40 & Pop Music',
    color: ['#9B59B6', '#8E44AD'],
    image: require('../radioimg/sawtelghad.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 5,
    name: 'Virgin Radio',
    url: 'https://stream-150.zeno.fm/dwxw3p9vea0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJkd3h3M3A5dmVhMHV2IiwiaG9zdCI6InN0cmVhbS0xNTAuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Ijc2eUxRX2JsUTlLcnFrUXgyLUNQN2ciLCJpYXQiOjE3NTE4MjU3MzksImV4cCI6MTc1MTgyNTc5OX0.Dw-cWoezjcG8TluAYzenI7ujHKQlGL0k4U3JustXNPY',
    description: 'Contemporary Hits',
    color: ['#E74C3C', '#C0392B'],
    image: require('../radioimg/virginradio1.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 6,
    name: 'NRJ Radio',
    url: 'http://185.52.127.172/lb/55219/aac_64.mp3',
    description: 'Top 40, Pop, Electronic',
    color: ['#F39C12', '#E67E22'],
    image: require('../radioimg/nrj.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 7,
    name: 'Aghani Aghani',
    url: 'http://185.52.127.132/lb/1/aac_64.mp3',
    description: 'Arabic Pop',
    color: ['#8E44AD', '#9B59B6'],
    image: require('../radioimg/aghanaghani.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 8,
    name: 'Angamy',
    url: 'https://radio.avazfarsi.com:8010/radio.mp3',
    description: 'Arabic Music',
    color: ['#16A085', '#1ABC9C'],
    image: require('../radioimg/angamy.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 9,
    name: 'Jabal Lebanon',
    url: 'http://185.52.127.168/lb/2/aac_64.mp3',
    description: 'Arabic Music',
    color: ['#27AE60', '#2ECC71'],
    image: require('../radioimg/jaballebanon.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 10,
    name: 'Byblos Radio',
    url: 'http://byblosnights.com:8360/;',
    description: 'Local Music',
    color: ['#2980B9', '#3498DB'],
    image: require('../radioimg/byblosradio.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 11,
    name: 'Adeem Radio',
    url: 'https://usa19.fastcast4u.com/adeem',
    description: 'Arabic Music',
    color: ['#D35400', '#E67E22'],
    image: require('../radioimg/adeem.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 12,
    name: 'Radio Fairouziat',
    url: 'https://stream-156.zeno.fm/9vrahqqfuuhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI5dnJhaHFxZnV1aHZ2IiwiaG9zdCI6InN0cmVhbS0xNTYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Il9sNksxM0hKUWNhZDRDcmZEY1FRdVEiLCJpYXQiOjE3NTE4MjY0ODcsImV4cCI6MTc1MTgyNjU0N30.0iRXz3pb8TC7t3tWqZkv2F343KKaiNw3ivfJshg_sss',
    description: 'Fairuz Classics',
    color: ['#A569BD', '#BB8FCE'],
    image: require('../radioimg/fairouziat.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 13,
    name: 'Radio Orient',
    url: 'https://audio-edge-cmc51.fra.h.radiomast.io/69a2563f-dc86-4b76-a823-a4c314b08bdf?referer=onlineradiobox',
    description: 'Arabic Music, Talk',
    color: ['#E74C3C', '#F1948A'],
    image: require('../radioimg/orient.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 14,
    name: 'Radio Souvenirs',
    url: 'https://stream-158.zeno.fm/4g8xck48kfhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI0Zzh4Y2s0OGtmaHZ2IiwiaG9zdCI6InN0cmVhbS0xNTguemVuby5mbSIsInJ0dGwiOjUsImp0aSI6ImNmYnNTekNUUzNHNkV4Nnp3d29ZREEiLCJpYXQiOjE3NTE4MjY1ODMsImV4cCI6MTc1MTgyNjY0M30.js2tw60uURb3Bjqs9LZyv8oBnW6eOAqjGnOogTu5eow',
    description: 'Oldies',
    color: ['#7D3C98', '#8E44AD'],
    image: require('../radioimg/souvenirsradio.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 15,
    name: 'IBM Online Radio',
    url: 'https://stream-176.zeno.fm/fau8h70x5hhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJmYXU4aDcweDVoaHZ2IiwiaG9zdCI6InN0cmVhbS0xNzYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6ImY1eFA5TjR1U3JlcHIzcW0tODV5dWciLCJpYXQiOjE3NTE4MjY4MjUsImV4cCI6MTc1MTgyNjg4NX0.eaG2_ZDUc1qtS9RsFag-JTCjrcfuTOp1s0z9shbMoBY',
    description: 'Variety',
    color: ['#34495E', '#5D6D7E'],
    image: require('../radioimg/ibmradio.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 16,
    name: 'Radio Alhaan',
    url: 'https://stream-157.zeno.fm/407axfdtcphvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI0MDdheGZkdGNwaHZ2IiwiaG9zdCI6InN0cmVhbS0xNTcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IjA4cGRLZHVmVGRlVGFRMHQzRjhxN0EiLCJpYXQiOjE3NTE4MjY4NzksImV4cCI6MTc1MTgyNjkzOX0.-imm9FfX6hLNO-XZc7ve9_mjvKGPBNyc0rcnH011ZWE',
    description: 'Arabic Music',
    color: ['#B7950B', '#D4AC0D'],
    image: require('../radioimg/alhaan.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 17,
    name: 'Playloud Radio',
    url: 'https://stream-173.zeno.fm/mtyqgubeunhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJtdHlxZ3ViZXVuaHZ2IiwiaG9zdCI6InN0cmVhbS0xNzMuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InFXcGVXWkVDUWJ5eFUyUm5BdlVKWmciLCJpYXQiOjE3NTE4MjY5NzIsImV4cCI6MTc1MTgyNzAzMn0.IJbz-OB0nzymngphIqdthHv8ZIqt8kj6dBoNwFb1VWM',
    description: 'Contemporary Hits',
    color: ['#E67E22', '#F39C12'],
    image: require('../radioimg/playloud.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 18,
    name: 'Virgin Radio Stars',
    url: 'https://stream-142.zeno.fm/h66yxnapga0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJoNjZ5eG5hcGdhMHV2IiwiaG9zdCI6InN0cmVhbS0xNDIuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IkNrUXJZN1huUkFDcWNpamFHaEgzcGciLCJpYXQiOjE3NTE4MjcwODksImV4cCI6MTc1MTgyNzE0OX0.KS0QiaAsmfdpRCYwWeRy2qoaWpXyf07QN56o-5pKrOs',
    description: 'Pop, Talk',
    color: ['#C0392B', '#E74C3C'],
    image: require('../radioimg/virginstars.png'),
    genre: 'Music & Entertainment'
  },
  {
    id: 19,
    name: 'Sawt El Mada',
    url: 'http://audiostreaming.itworkscdn.com:9018/stream',
    description: 'صوت المدى',
    color: ['#45B7D1', '#96C93D'],
    image: require('../radioimg/sawtelghad.png'), // Using sawtelghad as placeholder
    genre: 'Music & Entertainment'
  },
  {
    id: 20,
    name: 'The Vibe Radio',
    url: 'https://stream-162.zeno.fm/zr736mbgqrhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ6cjczNm1iZ3FyaHZ2IiwiaG9zdCI6InN0cmVhbS0xNjIuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IlNQdnlURWxSUzNtTzRoQzZBUUFjU0EiLCJpYXQiOjE3NTE4MjcyMTksImV4cCI6MTc1MTgyNzI3OX0.jm5FkL3UZcjQTRY46nVl9-PhSBS0sHK3wE0nNXqDXLY',
    description: 'Hip-Hop, R&B',
    color: ['#2C3E50', '#34495E'],
    image: require('../radioimg/mixfm.png'), // Using mixfm as placeholder
    genre: 'Music & Entertainment'
  },
  {
    id: 21,
    name: 'Nostalgie FM',
    url: 'https://fmradiohub.in/radio?url=http://185.52.127.170/lb/55157/mp3_128.mp3?adws_out_3&access_token=df182d1b36734cdeb2ce8192c243b5f0',
    description: 'Oldies',
    color: ['#922B21', '#A93226'],
    image: require('../radioimg/nostalgie.png'),
    genre: 'Music & Entertainment'
  },
  
  // 📰 News & Talk
  {
    id: 22,
    name: 'Voice of Lebanon',
    url: 'https://l3.itworkscdn.net/itwaudio/9054/stream',
    description: 'News, Talk',
    color: ['#4ECDC4', '#44A08D'],
    image: require('../radioimg/voixduliban.png'),
    genre: 'News & Talk'
  },
  {
    id: 23,
    name: 'Radio Liban Libre',
    url: 'https://edge.mixlr.com/channel/qtqeb',
    description: 'News, Music, Cultural Programs',
    color: ['#148F77', '#16A085'],
    image: require('../radioimg/libanlibre.png'),
    genre: 'News & Talk'
  },
  {
    id: 24,
    name: 'Sawt El Shaeb',
    url: 'https://stream-159.zeno.fm/zg53crxbbshvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ6ZzUzY3J4YmJzaHZ2IiwiaG9zdCI6InN0cmVhbS0xNTkuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IjJJMm56MXhhUldpYnppNmEtYVo2NlEiLCJpYXQiOjE3NTE4MjU0NTIsImV4cCI6MTc1MTgyNTUxMn0.Az2dJgwnVD2mKnY-wOnsmIUBIXK8CthUg4kg72BAdXk',
    description: 'Pop, News, Folk',
    color: ['#17A2B8', '#138496'],
    image: require('../radioimg/sawtelghad.png'), // Using sawtelghad as placeholder
    genre: 'News & Talk'
  },
  {
    id: 25,
    name: 'La Voix du Liban',
    url: 'http://vps1.osina.cloud:9318/stream',
    description: 'News, Talk',
    color: ['#6C757D', '#495057'],
    image: require('../radioimg/voixduliban.png'),
    genre: 'News & Talk'
  },
  {
    id: 26,
    name: 'LBI Radio',
    url: 'http://andromeda.shoutca.st:8192/;',
    description: 'Talk, Local Content',
    color: ['#28A745', '#20C997'],
    image: require('../radioimg/lbiradio.png'),
    genre: 'News & Talk'
  },
  
  // ✝️ Religious
  {
    id: 27,
    name: 'Voice of Charity',
    url: 'https://cast6.asurahosting.com/proxy/voiceofc/stream',
    description: 'Christian, Talk',
    color: ['#007BFF', '#0056B3'],
    image: require('../radioimg/voixduliban.png'), // Using voixduliban as placeholder
    genre: 'Religious'
  },
  {
    id: 28,
    name: 'Sawt Al Hoda',
    url: 'https://l3.itworkscdn.net/itwaudio/9032/stream',
    description: 'Islamic Content',
    color: ['#28A745', '#155724'],
    image: require('../radioimg/sotaalhoda.png'),
    genre: 'Religious'
  },
  {
    id: 29,
    name: 'Ayat (Quran)',
    url: 'https://stream-154.zeno.fm/1fatuk10fkhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiIxZmF0dWsxMGZraHZ2IiwiaG9zdCI6InN0cmVhbS0xNTQuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InZET1VjdklOUnJPLWdaUFNmSVhwT2ciLCJpYXQiOjE3NTE4MjY5MTcsImV4cCI6MTc1MTgyNjk3N30.Zjgp190URKy5zsDLZsnEegr-POdE2_IVRQSw3W5RRLE',
    description: 'Quranic Recitations',
    color: ['#198754', '#0F5132'],
    image: require('../radioimg/ayat.png'),
    genre: 'Religious'
  },
  {
    id: 30,
    name: 'Al Nour',
    url: 'https://l3.itworkscdn.net/itwaudio/9066/stream',
    description: 'إذاعة النور',
    color: ['#FF6B6B', '#FF8E8E'],
    image: require('../radioimg/alnour.png'),
    genre: ['Religious', 'News & Talk']
  }
];

export default radioStations;
