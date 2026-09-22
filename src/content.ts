export type Work = { id: string; title: string; description: string; images: string[]; category: 'cakes' | 'cookies' | 'bread' };
export const site = { maxUrl: '', heroVideo: '' };
export const works: Work[] = [
 {id:'berry',title:'Ягодное настроение',description:'Малина, голубика и шоколадные потёки. Маленький праздник в деталях.',images:['berry','berry-cut'],category:'cakes'},
 {id:'raspberry',title:'Нежность в деталях',description:'Тёплые оттенки, малина и тонкий цветочный декор.',images:['raspberry','raspberry-half','raspberry-cut'],category:'cakes'},
 {id:'eight',title:'Особенный день',description:'Торт-цифра с ягодами и золотистыми бабочками.',images:['eight','eight-cut'],category:'cakes'},
 {id:'cherry',title:'Вишнёвый акцент',description:'Глянцевая вишня и лаконичная форма. Красота без лишних деталей.',images:['cherry','cherry-cut'],category:'cakes'},
 {id:'chocolate',title:'Шоколадная история',description:'Гладкая шоколадная поверхность и фактурный край.',images:['chocolate','chocolate-cut'],category:'cakes'},
 {id:'basque',title:'С румяной корочкой',description:'Золотистая середина, тёмная корочка и подача с шоколадом.',images:['basque','basque-cut','basque-chocolate'],category:'cakes'},
 {id:'cookies',title:'Печенье к чаю',description:'Разные оттенки, рассыпчатая фактура и повод сделать паузу.',images:['cookies'],category:'cookies'},
 {id:'rolls',title:'Слой за слоем',description:'Золотистые завитки, глазурь и немного хрустящей крошки.',images:['rolls'],category:'bread'},
 {id:'buns',title:'Тёплые завитки',description:'Румяные булочки под белой шапочкой крема.',images:['buns'],category:'bread'},
 {id:'bread',title:'Хлеб к общему столу',description:'Румяная корочка и воздушный мякиш. Рассмотрите его вблизи.',images:['bread'],category:'bread'},
 {id:'seed-bread',title:'Хлеб с семечками',description:'Живая фактура, раскрывшаяся корочка и россыпь семечек.',images:['seed-bread'],category:'bread'},
];
export const photo = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;
