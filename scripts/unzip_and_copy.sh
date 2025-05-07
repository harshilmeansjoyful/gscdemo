#!/bin/bash
echo "Unzipping and copying deployment files..."

# Set the S3 bucket path
S3_BUCKET="s3://gsc-ui"
DEST_DIR="/home/ec2-user/gsc"

# Create the destination directory if it doesn't exist
mkdir -p $DEST_DIR

# Download files from S3
aws s3 cp $S3_BUCKET $DEST_DIR --recursive

# Move to the destination directory
cd $DEST_DIR

# Check if there are any zip files
ZIP_FILES=$(ls *.zip 2>/dev/null)

if [ -z "$ZIP_FILES" ]; then
  echo "No .zip files found in the directory."
else
  # Check if the downloaded file is a zip archive
  for file in *.zip; do
    if [ -f "$file" ]; then
      echo "Unzipping $file"
      unzip -o "$file" -d "$DEST_DIR"
      echo "$file unzipped successfully."
    fi
  done
fi

echo "Deployment files copied and unzipped successfully."
