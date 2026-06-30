import { ModernCard } from '@/components/ModernCard';
import { WorkshopImage } from '@/components/WorkshopImage';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../firebase';

const SERVICES = [
  { id: '1', title: 'Flat Tyre', icon: 'tire', color: '#6366f1' },
  { id: '2', title: 'Towing', icon: 'truck-trailer', color: '#8b5cf6' },
  { id: '3', title: 'Battery', icon: 'battery-charging', color: '#3b82f6' },
  { id: '4', title: 'Engine', icon: 'engine', color: '#f59e0b' },
];

export default function PemanduHomeScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60 + insets.bottom;

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'bengkel'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkshops(list);
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = (serviceId: string) => {
    if (selectedServiceId === serviceId) {
      setSelectedServiceId(null);
    } else {
      setSelectedServiceId(serviceId);
    }
  };

  const filteredWorkshops = workshops.filter((workshop) => {
    // 1. Service filter
    let matchesService = true;
    if (selectedServiceId) {
      if (selectedServiceId === '1') matchesService = workshop.selectedServices?.includes(2);
      else if (selectedServiceId === '2') matchesService = workshop.selectedServices?.includes(1);
      else if (selectedServiceId === '3') matchesService = workshop.selectedServices?.includes(1) || workshop.selectedServices?.includes(4);
      else if (selectedServiceId === '4') matchesService = workshop.selectedServices?.includes(4);
    }

    // 2. Search query filter
    let matchesSearch = true;
    if (search) {
      const queryLower = search.toLowerCase();
      const nameMatch = workshop.name?.toLowerCase().includes(queryLower);
      const addressMatch = workshop.address?.toLowerCase().includes(queryLower);
      matchesSearch = !!(nameMatch || addressMatch);
    }

    return matchesService && matchesSearch;
  });

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 + insets.bottom + 20 }}
      // iOS: avoid any accidental overlay stacking over the tab bar area
      keyboardShouldPersistTaps="handled"
      pointerEvents="auto"
    >
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text variant="headlineSmall" style={styles.welcomeTitle}>Need assistance?</Text>
          <Text variant="bodyMedium" style={styles.welcomeSubtitle}>Select a service for immediate help</Text>
        </View>

        <View style={styles.serviceGrid}>
          {SERVICES.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.7}
                onPress={() => handleServicePress(service.id)}
                style={styles.serviceItem}
              >
                <Surface 
                  style={[
                    styles.serviceIconContainer,
                    isSelected && { 
                      backgroundColor: service.color + '15', 
                      borderWidth: 2, 
                      borderColor: service.color,
                      transform: [{ scale: 1.05 }]
                    }
                  ]} 
                  elevation={isSelected ? 0 : 1}
                >
                  <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
                </Surface>
                <Text 
                  variant="labelMedium" 
                  style={[
                    styles.serviceLabel, 
                    isSelected && { color: service.color, fontWeight: 'bold' }
                  ]}
                >
                  {service.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {selectedServiceId 
              ? `Nearby for ${SERVICES.find(s => s.id === selectedServiceId)?.title}` 
              : 'Nearby Workshops'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 20 }} />
        ) : filteredWorkshops.length > 0 ? (
          filteredWorkshops.map((workshop) => (
            <View key={workshop.id} style={styles.shadowWrapper}>
            <ModernCard key={workshop.id} style={styles.bengkelCard} elevation={2}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.bengkelContent}
                onPress={() => router.push({ pathname: '/bengkelP', params: { id: workshop.id } } as any)}
              >
                <WorkshopImage
                  profilePicture={workshop.profilePicture}
                  workshopId={workshop.id}
                  style={styles.bengkelImage}
                  resizeMode="cover"
                />
                <View style={styles.bengkelDetails}>
                  <View style={styles.bengkelTitleRow}>
                    <Text variant="titleLarge" style={styles.bengkelName}>{workshop.name}</Text>
                    <View style={styles.ratingBadge}>
                      <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.ratingText}>{workshop.rating ?? '0.0'}</Text>
                    </View>
                  </View>

                  <View style={styles.bengkelInfoRow}>
                    <Feather name="map-pin" size={14} color="#64748b" />
                    <Text variant="bodySmall" style={styles.bengkelInfoText}>
                      {workshop.address || 'Address not available'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ModernCard>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: '#64748b', fontSize: 15 }}>No workshops found matching this service.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Keep your existing styles block exactly as it was below this line...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  welcomeSubtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  serviceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceItem: {
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  serviceLabel: {
    marginTop: 8,
    color: '#64748b',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  shadowWrapper: {
    shadowColor: '#000000', 
    shadowOffset: {
      width: 0,
      height: 4,                
    },
    shadowOpacity: 0.3,        
    shadowRadius: 5,            
    elevation: 6,               
    padding: 16,
  },
  bengkelCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  bengkelContent: {
    flexDirection: 'column',
  },
  bengkelImage: {
    width: '100%',
    height: 160,
  },
  bengkelDetails: {
    padding: 16,
  },
  bengkelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bengkelName: {
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d97706',
    marginLeft: 4,
  },
  bengkelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bengkelInfoText: {
    color: '#64748b',
    marginLeft: 6,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
});