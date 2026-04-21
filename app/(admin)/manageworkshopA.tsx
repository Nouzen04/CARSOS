import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from "react-native";
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ManageWorkshop() {
    const [page, setPage] = React.useState<number>(0);
    const itemsPerPage = 5;

    const [workshops, setWorkshops] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Listen to all bengkel users that are NOT yet verified
        const q = query(
            collection(db, "users"),
            where("role", "==", "bengkel"),
            where("verified", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setWorkshops(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching workshops:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, workshops.length);
    const totalPages = Math.ceil(workshops.length / itemsPerPage);

    const handleViewFiles = (workshop: any) => {
        const urls = workshop.documentURLs || [];
        if (urls.length === 0) {
            Alert.alert("No Files", "This workshop has not uploaded any documents.");
            return;
        }

        if (urls.length === 1) {
            Linking.openURL(urls[0]);
            return;
        }

        // Handle multiple files with selection buttons
        const buttons: any[] = urls.slice(0, 2).map((url: string, idx: number) => ({
            text: `Document ${idx + 1}`,
            onPress: () => Linking.openURL(url)
        }));
        
        buttons.push({ text: "Cancel", style: "cancel" });
        
        Alert.alert(
            "Review Documents",
            `This workshop has ${urls.length} documents. Which one would you like to inspect?`,
            buttons
        );
    };

    const handleConfirm = async (userId: string, orgName: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                verified: true
            });
            Alert.alert("✅ Verified", `${orgName} has been verified and confirmed!`);
        } catch (error) {
            console.error("Error confirming workshop:", error);
            Alert.alert("Error", "Failed to verify workshop. Please try again.");
        }
    };

    const handleReject = async (userId: string, orgName: string) => {
        Alert.alert(
            "Reject Workshop",
            `Are you sure you want to reject ${orgName}? This will delete their account.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "users", userId));
                            Alert.alert("Rejected", `${orgName} has been rejected and removed.`);
                        } catch (error) {
                            console.error("Error rejecting workshop:", error);
                            Alert.alert("Error", "Failed to reject workshop.");
                        }
                    }
                }
            ]
        );
    };

    const paginated = workshops.slice(from, to);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.headerContainer}>
                    <Text style={styles.screenTitle}>Pending Registrations</Text>
                    <Text style={styles.screenSubtitle}>Review submitted forms and files to verify workshop credibility.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 60 }} />
                ) : workshops.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No pending registrations.</Text>
                    </View>
                ) : (
                    paginated.map((item) => (
                        <View key={item.id} style={styles.card}>
                            {/* Status badge */}
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>Pending</Text>
                            </View>

                            {/* Workshop details */}
                            <Text style={styles.orgName}>{item.name || 'Unnamed Workshop'}</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>📧 Email</Text>
                                <Text style={styles.detailValue}>{item.email}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>📍 Address</Text>
                                <Text style={styles.detailValue}>{item.address || 'Not provided'}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>📞 Phone</Text>
                                <Text style={styles.detailValue}>{item.phone || 'Not provided'}</Text>
                            </View>

                            {item.selectedServices && item.selectedServices.length > 0 && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>🔧 Services</Text>
                                    <Text style={styles.detailValue}>{item.selectedServices.length} service(s) offered</Text>
                                </View>
                            )}

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Action buttons */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.viewBtn]}
                                    onPress={() => handleViewFiles(item)}
                                >
                                    <Text style={styles.btnText}>📄 Files</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, styles.confirmBtn]}
                                    onPress={() => handleConfirm(item.id, item.name)}
                                >
                                    <Text style={styles.btnText}>✓ Confirm</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, styles.rejectBtn]}
                                    onPress={() => handleReject(item.id, item.name)}
                                >
                                    <Text style={styles.btnText}>✕ Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {/* Pagination */}
                {!loading && workshops.length > itemsPerPage && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                            onPress={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <Text style={[styles.pageBtnText, page === 0 && styles.pageBtnTextDisabled]}>‹ Prev</Text>
                        </TouchableOpacity>

                        <Text style={styles.pageInfo}>
                            {from + 1}–{to} of {workshops.length}
                        </Text>

                        <TouchableOpacity
                            style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
                            onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            <Text style={[styles.pageBtnText, page >= totalPages - 1 && styles.pageBtnTextDisabled]}>Next ›</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f8fb',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    headerContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    screenSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 6,
    },

    // Card
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FEF3C7',
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    statusBadgeText: {
        color: '#D97706',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orgName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#64748b',
        width: 90,
    },
    detailValue: {
        fontSize: 13,
        color: '#334155',
        flex: 1,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },

    // Action buttons row
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBtn: {
        backgroundColor: '#3b82f6',
    },
    confirmBtn: {
        backgroundColor: '#10b981',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },

    // Pagination
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    pageBtn: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        color: '#1e293b',
        fontWeight: '600',
        fontSize: 13,
    },
    pageBtnTextDisabled: {
        color: '#94a3b8',
    },
    pageInfo: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '500',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});
