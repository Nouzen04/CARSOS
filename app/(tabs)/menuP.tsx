import { Text, View } from '@/components/Themed';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const SERVICES = [
  { id: '1', title: 'Flat Tyre', icon: require('../../assets/images/flat_tyre.png') },
  { id: '2', title: 'Towing', icon: require('../../assets/images/tow-truck.png') },
  { id: '3', title: 'Car Battery', icon: require('../../assets/images/car-battery.png') },
  { id: '4', title: 'Inspection', icon: require('../../assets/images/car_inspection.png') },
];

export default function TabOneScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.wordContainer}>
          <Text style={styles.title}>We can help you find the best bengkel for you</Text>
        </View>

        <View style={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.7}
              onPress={() => console.log(`${service.title} clicked!`)}
              style={styles.serviceCard}
            >
              <View style={styles.iconBackground}>
                <Image source={service.icon} style={styles.icon} />
              </View>
              <Text style={styles.serviceText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <View style={styles.wordContainer}>
          <Text style={styles.bengkel}>Bengkel</Text>
        </View>
        <View style={styles.card}>
          <Image source={require('../../assets/images/benkel.png')} style={styles.image} />
          <Text style={styles.cardText}>SNS Service</Text>
          <Text style={styles.cardText}>12 minutes away</Text>{/* map */}
        </View>
        {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
  },
  wordContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 32,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  serviceCard: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 12,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  bengkel: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',

    // For Android (Shadow)
    elevation: 4,

    // For iOS (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 224,
    resizeMode: 'stretch',
    alignSelf: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#1a1a1a',
    lineHeight: 24,
    marginLeft: 4,
  },
});
