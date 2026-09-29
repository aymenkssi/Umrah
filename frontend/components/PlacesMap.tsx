import React from 'react';
import { Linking, StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '../constants/api';
import { MapMessage, parseMapMessage } from '../utils/mapHtml';

interface Props {
  html: string;
  onMessage: (message: MapMessage) => void;
  style?: StyleProp<ViewStyle>;
}

/** Leaflet map page (utils/mapHtml.ts) in a WebView. Links such as the OSM attribution open in the browser. */
export function PlacesMap({ html, onMessage, style }: Props) {
  return (
    <WebView
      style={style}
      // The base URL gives the tile requests a Referer, as the OpenStreetMap tile policy asks.
      source={{ html, baseUrl: API_BASE_URL }}
      originWhitelist={['*']}
      onMessage={(event) => {
        const message = parseMapMessage(event.nativeEvent.data);
        if (message) onMessage(message);
      }}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url.startsWith(API_BASE_URL) || request.url.startsWith('about:')) return true;
        if (/^https?:/.test(request.url)) Linking.openURL(request.url).catch(() => undefined);
        return false;
      }}
      onError={() => onMessage({ type: 'offline' })}
      setSupportMultipleWindows={false}
      allowFileAccess={false}
      geolocationEnabled={false}
      javaScriptEnabled
    />
  );
}
