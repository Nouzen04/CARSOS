import { Text, View } from '@/components/Themed';
import Feather from '@expo/vector-icons/Feather';
import { ScrollView, StyleSheet } from 'react-native';

export default function TabThreeScreen() {
    const handleCall = () => {
        console.log('call now');
    };
    const SOS = [
        { id: '1', title: '🛣️ PLUS Highway (NKVE, ELITE, LINKEDUA...)', no: '1800-88-0000' },
        { id: '2', title: '🛣️ KESAS Highway ', no: '03-5633-7188' },
        { id: '3', title: '🛣️ WCE Highway ', no: '1700-81-6600' },
        { id: '4', title: '🛣️ ️SMART Tunnel ', no: '1300-88-7188' },
    ];
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.wordContainer}>
                    <Text style={styles.title}>🚨 Emergency Contacts.{'\n'}Tap to call highway assistance </Text>
                </View>

                <View style={styles.sosGrid}>
                </View>
                {SOS.map((sos) => (
                    <View
                        key={sos.id}
                        style={styles.card}>
                        <Text style={styles.cardText}>{sos.title}{'\n'}Number: {sos.no}</Text>
                        <View style={styles.call} >
                            <Feather name="phone-call" size={16} color="black" onPress={handleCall} />
                            <Text style={styles.innercardText} onPress={handleCall}>call now</Text>
                        </View>
                    </View>
                ))}
                {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
            </View>
        </ScrollView >
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
        marginTop: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'normal',
        color: '#1a1a1a',
        lineHeight: 22,
        marginStart: 1,
    },
    sosGrid: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
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
    call: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#1a1a1a',
        lineHeight: 24,
        marginLeft: 4,
    },
    innercardText: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#0000FF',
        lineHeight: 24,
        marginLeft: 4,
    },
});