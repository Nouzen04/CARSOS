import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabThreeScreen() {
    const handleCall = (no: string) => {
        Linking.openURL('tel:' + no);
    };

    const SOS = [
        { id: '1', title: 'PLUS Highway (NKVE, ELITE, LINKEDUA...)', no: '1800-88-0000', type: 'highway' },
        { id: '2', title: 'KESAS Highway', no: '03-5633-7188', type: 'highway' },
        { id: '3', title: 'WCE Highway', no: '1700-81-6600', type: 'highway' },
        { id: '4', title: 'SMART Tunnel', no: '1300-88-7188', type: 'highway' },
        { id: '5', title: 'Grand Saga Highway', no: '03-90750505', type: 'highway' },
        { id: '6', title: 'KLK Highway & LPT1', no: '1700-818-700', type: 'highway' },
        { id: '7', title: 'LPT2 Highway', no: '1800-80-0220', type: 'highway' },
        { id: '8', title: 'AKLEH & GCE Highway', no: '1800-22-8888', type: 'highway' },
        { id: '9', title: 'DUKE Highway', no: '03-6251-3100', type: 'highway' },
        { id: '10', title: 'SKVE Highway', no: '1300-88-0026', type: 'highway' },
        { id: '11', title: 'LATAR Highway', no: '03-6145-1515', type: 'highway' }
    ];

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name="alert-decagram" size={32} color="#EF4444" />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Emergency Contacts</Text>
                    <Text style={styles.subtitle}>Tap to call highway assistance</Text>
                </View>
            </View>

            <View style={styles.sosGrid}>
                {SOS.map((sos) => (
                    <TouchableOpacity
                        key={sos.id}
                        activeOpacity={0.7}
                        onPress={() => handleCall(sos.no)}
                        style={styles.card}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="road-variant" size={20} color={Colors.light.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{sos.title}</Text>
                                <Text style={styles.cardNumber}>{sos.no}</Text>
                            </View>
                            <View style={styles.callIconContainer}>
                                <Feather name="phone-call" size={18} color="#10B981" />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTextContainer: {
        marginLeft: 16,
        backgroundColor: '#FEF2F2',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#991B1B',
    },
    subtitle: {
        fontSize: 14,
        color: '#B91C1C',
        opacity: 0.8,
        marginTop: 2,
    },
    sosGrid: {
        gap: 12,
    },
    card: {
        backgroundColor: '#ecf6fdff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecf6fdff',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e7ffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
        backgroundColor: '#ecf6fdff',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: 20,
    },
    cardNumber: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    callIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
