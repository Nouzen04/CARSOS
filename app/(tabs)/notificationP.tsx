import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => console.log(`Card clicked!`)}>
          <View style={styles.card}>
            <View>
              <Image source={require('../../assets/images/wrench.png')} style={styles.icon} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Card Title</Text>
              <Text style={styles.cardText}>Assumenda ipsum veritatis, enim magnam sit officia dignissimos. Sequi illo quae provident at doloremque itaque, magnam laudantium! Velit, quisquam est? Vel.</Text>
            </View>
            <View style={styles.circleContainer}>
              <Text style={styles.circleInfo}>12{'\n'}mins</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.card}>
          <View>
            <Image source={require('../../assets/images/wrench.png')} style={styles.icon} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>Your mechanic has notify your problem. please wait for a while</Text>
          </View>
          <View style={styles.circleContainer}>
            <Text style={styles.circleInfo}>12{'\n'}mins</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  cardContent: {
    flexDirection: 'column',
    flex: 1,
    paddingLeft: 16,
    textAlign: 'auto',
  },
  card: {
    width: 388,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    // For Android (Shadow)
    elevation: 4,

    // For iOS (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#1a1a1a',
    lineHeight: 24,
    marginLeft: 4,
  },
  cardText: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#1a1a1a',
    lineHeight: 24,
    marginLeft: 4,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  circleInfo: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#1a1a1a',
    textAlign: 'center',
    overflow: 'hidden',
  },
  circleContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8baaff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginLeft: 20,
  },
});

