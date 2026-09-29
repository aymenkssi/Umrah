import { PLACES } from '../data/places';
import { buildMapHtml, mappable, parseMapMessage } from '../utils/mapHtml';

const options = {
  language: 'fr' as const,
  dark: false,
  colors: { primary: '#1', ritual: '#2', history: '#3', user: '#4', text: '#5', surface: '#6' },
  labels: { directions: 'Itinéraire', you: 'Vous êtes ici' },
};

describe('buildMapHtml', () => {
  it('draws the landmarks of the city with OpenStreetMap attribution', () => {
    const places = PLACES.filter((p) => p.city === 'makkah');
    const html = buildMapHtml({ ...options, places, user: { latitude: 21.42, longitude: 39.82 } });
    for (const place of mappable(places)) expect(html).toContain(`"id":"${place.id}"`);
    expect(html).toContain('tile.openstreetmap.org');
    expect(html).toContain('OpenStreetMap</a>');
    expect(html).toContain('integrity="sha256-');
    expect(html).toContain('"user":[21.42,39.82]');
  });

  it('cannot be broken out of the script element by place text', () => {
    const place = { ...PLACES[0], name: { ar: 'x', en: 'x', fr: '</script><script>alert(1)</script>' } };
    const html = buildMapHtml({ ...options, places: [place] });
    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('\\u003c/script>');
  });
});

describe('parseMapMessage', () => {
  it('accepts only the expected messages', () => {
    expect(parseMapMessage('{"type":"directions","id":"haram"}')).toEqual({ type: 'directions', id: 'haram' });
    expect(parseMapMessage('{"type":"offline"}')).toEqual({ type: 'offline' });
    expect(parseMapMessage('{"type":"directions","id":3}')).toBeNull();
    expect(parseMapMessage('not json')).toBeNull();
    expect(parseMapMessage({ type: 'offline' })).toBeNull();
  });
});
