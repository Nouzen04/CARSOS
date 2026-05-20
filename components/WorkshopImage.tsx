import { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

const DEFAULT_WORKSHOP_IMAGE = require('../assets/images/benkel.png');

type WorkshopImageProps = {
  profilePicture?: string | null;
  workshopId?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

/**
 * Shows workshop photo from Firestore profilePicture URL, else tries Storage
 * workshop_profiles/{workshopId}.jpg, else local benkel.png placeholder.
 */
export function WorkshopImage({
  profilePicture,
  workshopId,
  style,
  resizeMode = 'cover',
}: WorkshopImageProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [useDefault, setUseDefault] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyDefault = () => {
      if (!cancelled) {
        setUri(null);
        setUseDefault(true);
      }
    };

    const applyUri = (url: string) => {
      if (!cancelled) {
        setUri(url);
        setUseDefault(false);
      }
    };

    if (profilePicture) {
      applyUri(profilePicture);
      return () => {
        cancelled = true;
      };
    }

    if (!workshopId) {
      applyDefault();
      return () => {
        cancelled = true;
      };
    }

    setUseDefault(true);
    getDownloadURL(ref(storage, `workshop_profiles/${workshopId}.jpg`))
      .then(applyUri)
      .catch(applyDefault);

    return () => {
      cancelled = true;
    };
  }, [profilePicture, workshopId]);

  if (useDefault || !uri) {
    return (
      <Image
        source={DEFAULT_WORKSHOP_IMAGE}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        setUri(null);
        setUseDefault(true);
      }}
    />
  );
}
