import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import {pick} from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {ActionButton, LoadingOverlay, SectionHeader} from '../components';
import {adiApi, sharePointApi} from '../services/api';
import {ExtractedBillData} from '../types';

export default function UploadScreen({navigation}: any) {
  const [selectedFile, setSelectedFile] = useState<{uri: string; name: string; type: string} | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const pickFile = async () => {
    try {
      const [result] = await pick({type: ['application/pdf', 'image/jpeg', 'image/png']});
      if (result) {
        setSelectedFile({uri: result.uri, name: result.name || 'document', type: result.type || 'application/pdf'});
        setExtractedData(null);
      }
    } catch {
      // User cancelled
    }
  };

  const extractData = async () => {
    if (!selectedFile) {return;}

    setLoading(true);
    setLoadingMessage('Uploading to Azure AI...');
    try {
      const fileBase64 = await ReactNativeBlobUtil.fs.readFile(selectedFile.uri, 'base64');
      setLoadingMessage('Analyzing document...');
      const result = await adiApi.analyzeDocument(fileBase64, selectedFile.type);

      if (result.status === 'succeeded' && result.analyzeResult?.documents?.[0]) {
        const fields = result.analyzeResult.documents[0].fields;
        const extracted: ExtractedBillData = {
          billDate: fields.billDate?.content,
          vendorName: fields.vendorName?.content,
          amount: fields.amount ? parseFloat(fields.amount.content) : undefined,
          unit: fields.unit?.content,
          billNumber: fields.billNumber?.content,
          totalCost: fields.totalCost ? parseFloat(fields.totalCost.content) : undefined,
          confidence: Math.min(
            ...Object.values(fields).map(f => f.confidence || 0),
          ),
        };
        setExtractedData(extracted);
        Alert.alert('Success', 'Data extracted successfully!');
      } else {
        Alert.alert('Error', 'Document analysis failed');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to extract data');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const uploadToSharePoint = async () => {
    if (!selectedFile) {return;}

    setLoading(true);
    setLoadingMessage('Uploading to SharePoint...');
    try {
      const year = new Date().getFullYear().toString();
      const folderPath = `${year}/Uploaded`;
      await sharePointApi.createFolder(folderPath);

      const fileBase64 = await ReactNativeBlobUtil.fs.readFile(selectedFile.uri, 'base64');
      const result = await sharePointApi.uploadFile(folderPath, selectedFile.name, fileBase64, selectedFile.type);

      Alert.alert('Uploaded', `File uploaded to SharePoint\n${result.webUrl}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload to SharePoint');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const useExtractedData = () => {
    if (extractedData) {
      navigation.navigate('ManualEntry', {
        draft: {
          id: `extract-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          postingDate: extractedData.billDate || new Date().toISOString().split('T')[0],
          description: `Bill from ${extractedData.vendorName || 'Unknown'} - ${extractedData.billNumber || ''}`,
          quantity: extractedData.amount || 0,
          unitOfMeasure: extractedData.unit || 'kWh',
          customAmount: extractedData.totalCost || 0,
          vendorName: extractedData.vendorName,
          extractedData,
          accountNo: '',
          accountName: '',
          categoryCode: '',
          subcategoryCode: '',
          calculationType: 'Fuel/Electricity',
          emissionCO2: 0,
          emissionCH4: 0,
          emissionN2O: 0,
          attachmentUri: selectedFile?.uri,
          attachmentName: selectedFile?.name,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay visible={loading} message={loadingMessage} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.uploadArea, shadows.card]}>
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadTitle}>Upload a Bill</Text>
          <Text style={styles.uploadSubtitle}>
            Select a PDF or image of your utility bill to extract data using AI
          </Text>
          <ActionButton title="Select File" onPress={pickFile} variant="outline" style={styles.selectBtn} />
        </View>

        {selectedFile && (
          <View style={[styles.fileCard, shadows.card]}>
            <Text style={styles.fileName}>📎 {selectedFile.name}</Text>
            <Text style={styles.fileType}>{selectedFile.type}</Text>
            <View style={styles.fileActions}>
              <ActionButton title="Extract Data" onPress={extractData} style={styles.extractBtn} />
              <ActionButton title="Upload to SharePoint" onPress={uploadToSharePoint} variant="secondary" style={styles.spBtn} />
            </View>
          </View>
        )}

        {extractedData && (
          <>
            <SectionHeader title="Extracted Data" />
            <View style={[styles.dataCard, shadows.card]}>
              {extractedData.vendorName && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Vendor</Text>
                  <Text style={styles.dataValue}>{extractedData.vendorName}</Text>
                </View>
              )}
              {extractedData.billDate && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Bill Date</Text>
                  <Text style={styles.dataValue}>{extractedData.billDate}</Text>
                </View>
              )}
              {extractedData.amount !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Amount</Text>
                  <Text style={styles.dataValue}>{extractedData.amount} {extractedData.unit || ''}</Text>
                </View>
              )}
              {extractedData.totalCost !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Total Cost</Text>
                  <Text style={styles.dataValue}>₹{extractedData.totalCost}</Text>
                </View>
              )}
              {extractedData.billNumber && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Bill Number</Text>
                  <Text style={styles.dataValue}>{extractedData.billNumber}</Text>
                </View>
              )}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Confidence</Text>
                <Text style={[styles.dataValue, {color: extractedData.confidence > 0.8 ? colors.success : colors.warning}]}>
                  {Math.round(extractedData.confidence * 100)}%
                </Text>
              </View>
              <ActionButton title="Use in Entry" onPress={useExtractedData} style={styles.useBtn} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  uploadArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },
  uploadIcon: {fontSize: 48, marginBottom: spacing.md},
  uploadTitle: typography.h3,
  uploadSubtitle: {...typography.bodySmall, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md},
  selectBtn: {minWidth: 160},
  fileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  fileName: {...typography.body, fontWeight: '600'},
  fileType: {...typography.caption, marginTop: spacing.xs},
  fileActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  extractBtn: {flex: 1},
  spBtn: {flex: 1},
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dataLabel: {...typography.bodySmall, color: colors.textSecondary},
  dataValue: {...typography.body, fontWeight: '600'},
  useBtn: {marginTop: spacing.md},
});
