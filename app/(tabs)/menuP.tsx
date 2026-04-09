import { Href, router } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface, useTheme, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';

const SERVICES = [
  { id: '1', title: 'Flat Tyre', icon: 'tire', color: '#6366f1' },
  { id: '2', title: 'Towing', icon: 'truck-trailer', color: '#8b5cf6' },
  { id: '3', title: 'Battery', icon: 'battery-charging', color: '#3b82f6' },
  { id: '4', title: 'Engine', icon: 'engine', color: '#f59e0b' },
];

export default function PemanduHomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text variant="headlineSmall" style={styles.welcomeTitle}>Need assistance?</Text>
          <Text variant="bodyMedium" style={styles.welcomeSubtitle}>Select a service for immediate help</Text>
        </View>

        <View style={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.7}
              onPress={() => console.log(`${service.title} clicked!`)}
              style={styles.serviceItem}
            >
              <Surface style={styles.serviceIconContainer} elevation={1}>
                <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
              </Surface>
              <Text variant="labelMedium" style={styles.serviceLabel}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Nearby Workshops</Text>
          <TouchableOpacity>
            <Text variant="labelLarge" style={{ color: Colors.light.primary }}>See All</Text>
          </TouchableOpacity>
        </View>

        <ModernCard style={styles.bengkelCard} elevation={2}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bengkelContent}
            onPress={() => router.push('/bengkelP' as Href)}
          >
            <Image 
              source={require('../../assets/images/benkel.png')} 
              style={styles.bengkelImage} 
              resizeMode="cover" 
            />
            <View style={styles.bengkelDetails}>
              <View style={styles.bengkelTitleRow}>
                <Text variant="titleLarge" style={styles.bengkelName}>SNS Service Center</Text>
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
              
              <View style={styles.bengkelInfoRow}>
                <Feather name="map-pin" size={14} color="#64748b" />
                <Text variant="bodySmall" style={styles.bengkelInfoText}>2.4 km • 12 minutes away</Text>
              </View>

              <View style={styles.tagGrid}>
                {['Towing', 'Tyre', 'Quick Fix'].map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </ModernCard>

        {/* Placeholder for more cards */}
        <ModernCard style={[styles.bengkelCard, { opacity: 0.7 }]} elevation={1}>
          <View style={styles.bengkelContent}>
             <View style={[styles.bengkelImage, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialCommunityIcons name="image-outline" size={40} color="#94a3b8" />
             </View>
             <View style={styles.bengkelDetails}>
                <Text variant="titleLarge" style={styles.bengkelName}>Modern Auto Clinic</Text>
                <Text variant="bodySmall" style={styles.bengkelInfoText}>3.8 km • 18 minutes away</Text>
             </View>
          </View>
        </ModernCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  welcomeSubtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  serviceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  serviceItem: {
    width: '22%',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceLabel: {
    textAlign: 'center',
    color: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bengkelCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bengkelContent: {
    flexDirection: 'column',
  },
  bengkelImage: {
    width: '100%',
    height: 180,
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
    color: '#0f172a',
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
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bengkelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bengkelInfoText: {
    color: '#64748b',
    marginLeft: 6,
  },
  tagGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
});
