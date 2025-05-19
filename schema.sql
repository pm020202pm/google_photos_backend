
CREATE TABLE photos (
    id TEXT PRIMARY KEY,                       -- Unique Google Drive file ID
    account_number VARCHAR(255) NOT NULL,      -- Account number (user ID)
    user_id INT NOT NULL,                      -- User ID (foreign key)
    name TEXT NOT NULL,                        -- File name
    mime_type TEXT NOT NULL,                   -- MIME type
    description TEXT,                          -- Optional file description
    size BIGINT,                               -- Size in bytes (null for folders)
    created_time TIMESTAMPTZ,                  -- File creation time
    modified_time TIMESTAMPTZ,                 -- Last modified time
    viewed_by_me_time TIMESTAMPTZ,             -- Last viewed by the user
    web_view_link TEXT,                        -- View link in Drive
    web_content_link TEXT,                     -- Direct download link
    icon_link TEXT,                            -- Google Drive file type icon
    thumbnail_link TEXT,                       -- Link to thumbnail preview
    md5_checksum TEXT,                         -- MD5 checksum of file content
    parents TEXT[],                            -- List of parent folder IDs
    trashed BOOLEAN DEFAULT FALSE,             -- Whether the file is trashed
    starred BOOLEAN DEFAULT FALSE,             -- Whether the file is starred
    shared BOOLEAN DEFAULT FALSE,              -- Whether the file is shared
    owners JSONB,                              -- List of file owners
    permissions JSONB,                         -- Permission list (if needed)
    capabilities JSONB                         -- User capabilities on the file
);