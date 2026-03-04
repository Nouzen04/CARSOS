import Feather from '@expo/vector-icons/Feather';
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";


const mapcall = () => {
    console.log('mapcall');
}
export default function infoBengkel() {
    return (
        <ScrollView>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>SNS Service</Text>
                <Image source={require('../../assets/images/benkel.png')} style={styles.image} />
                <View style={styles.map}>
                    <Feather name="map-pin" size={20} color="black" />
                    <Text style={styles.cardLink} onPress={mapcall}>12 minutes away</Text>{/* map */}
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardText2}>Description</Text>
                    <Text style={styles.cardText}>adipisicing elit. Explicabo qui at quibusdam pariatur incidunt asperiores, ea, dolores, labore distinctio iusto quidem. Tempore molestiae porro excepturi dicta odio ratione accusamus nostrum!</Text>{/* map */}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 20,

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
        height: 400,
        resizeMode: 'stretch',
        alignSelf: 'center',
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'normal',
        color: '#1a1a1a',
        lineHeight: 24,
        marginLeft: 4,
        paddingBottom: 12,
    },
    cardLink: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#0000FF',
        lineHeight: 24,
        marginLeft: 4,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#1a1a1a',
        lineHeight: 24,
        marginLeft: 4,
    },
    cardText2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        lineHeight: 24,
        marginLeft: 4,
    },
    cardInfo: {
        flexDirection: 'column',
        gap: 4,
        marginTop: 16,
    },
    map: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 16,
    },
})