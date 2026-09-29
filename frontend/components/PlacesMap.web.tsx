import React, { useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { MapMessage, parseMapMessage } from '../utils/mapHtml';

interface Props {
  html: string;
  onMessage: (message: MapMessage) => void;
  style?: StyleProp<ViewStyle>;
}

/** Web version: the same Leaflet page in a sandboxed iframe. */
export function PlacesMap({ html, onMessage, style }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = parseMapMessage(event.data);
      if (message) onMessage(message);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onMessage]);

  return (
    <View style={style}>
      <iframe
        ref={frame}
        title="map"
        srcDoc={html}
        sandbox="allow-scripts allow-popups"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </View>
  );
}
