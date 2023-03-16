const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');

exports.handler = async (event) => {
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstKey = 'resized/' + srcKey.replace('uploads/', '');

    try {
        const imageObject = await S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
        const resizedImageBuffer = await sharp(imageObject.Body)
            .resize({ width: 300 })
            .toBuffer();

        await S3.putObject({
            Bucket: srcBucket,
            Key: dstKey,
            Body: resizedImageBuffer,
            ContentType: 'image/jpeg'
        }).promise();

        console.log('Image resized and uploaded:', dstKey);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};