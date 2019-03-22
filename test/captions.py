# -*- coding: utf-8 -*-

import os
import io
import google.oauth2.credentials
from dotenv import load_dotenv
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow
import json
import pprint
# import oauth2client
# from oauth2client.client import GoogleCredentials
from google.oauth2 import service_account
import pickle

load_dotenv()

# The CLIENT_SECRETS_FILE variable specifies the name of a file that contains
# the OAuth 2.0 information for this application, including its client_id and
# client_secret.
CLIENT_SECRETS_FILE = "client_secret.json"

# This OAuth 2.0 access scope allows for full read/write access to the
# authenticated user's account and requires requests to use an SSL connection.
SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'


def get_authenticated_service():
    if os.path.isfile('credentials.bin'):
        credentials = pickle.load(io.open('credentials.bin', 'rb'))
        return build(API_SERVICE_NAME, API_VERSION, credentials=credentials)
    elif os.path.isfile('-credentials.json'):
        fp = io.open('credentials.json', 'r')
        print(fp)
        data = json.load(fp)
        pprint.pprint(data)
        credentials = service_account.Credentials(
            None,
            refresh_token=data['refresh_token'],
            id_token=data['id_token'],
            token_uri=data['token_uri'],
            client_id=data['client_id'],
            client_secret=data['client_secret'],
            # scopes=data['scopes']
        )
        return build(API_SERVICE_NAME, API_VERSION, credentials=credentials)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
        credentials = flow.run_console()
        pprint.pprint({
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'id_token': credentials.id_token,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'requires_scopes': credentials.requires_scopes,
        })
        pickle.dump(credentials, io.open('credentials.bin', 'wb'))
        return build(API_SERVICE_NAME, API_VERSION, credentials=credentials)
        # return build(API_SERVICE_NAME, API_VERSION, developerKey=os.getenv('GOOGLE_API_KEY'))


# Build a resource based on a list of properties given as key-value pairs.
# Leave properties with empty values out of the inserted resource.
def build_resource(properties):
    resource = {}
    for p in properties:
        # Given a key like "snippet.title", split into "snippet" and "title", where
        # "snippet" will be an object and "title" will be a property in that object.
        prop_array = p.split('.')
        ref = resource
        for pa in range(0, len(prop_array)):
            is_array = False
            key = prop_array[pa]

            # For properties that have array values, convert a name like
            # "snippet.tags[]" to snippet.tags, and set a flag to handle
            # the value as an array.
            if key[-2:] == '[]':
                key = key[0:len(key) - 2:]
                is_array = True

            if pa == (len(prop_array) - 1):
                # Leave properties without values out of inserted resource.
                if properties[p]:
                    if is_array:
                        ref[key] = properties[p].split(',')
                    else:
                        ref[key] = properties[p]
            elif key not in ref:
                # For example, the property is "snippet.title", but the resource does
                # not yet have a "snippet" object. Create the snippet object here.
                # Setting "ref = ref[key]" means that in the next time through the
                # "for pa in range ..." loop, we will be setting a property in the
                # resource's "snippet" object.
                ref[key] = {}
                ref = ref[key]
            else:
                # For example, the property is "snippet.description", and the resource
                # already has a "snippet" object.
                ref = ref[key]
    return resource


# Remove keyword arguments that are not set
def remove_empty_kwargs(**kwargs):
    good_kwargs = {}
    if kwargs is not None:
        for key, value in kwargs.items():
            if value:
                good_kwargs[key] = value
    return good_kwargs


def captions_list(client, **kwargs):
    # See full sample for function
    kwargs = remove_empty_kwargs(**kwargs)

    response = client.captions().list(
        **kwargs
    ).execute()

    return print_response(response)


def print_response(response):
    # data = json.loads(response)
    data = response
    for item in data['items']:
        pprint.pprint(item)
        if item['snippet']['language'] == 'en':
            text = client.captions().download(
                id=item['id'],
                onBehalfOfContentOwner='',
                tfmt='srt'
            ).execute()
            print(text)


if __name__ == '__main__':
    # When running locally, disable OAuthlib's HTTPs verification. When
    # running in production *do not* leave this option enabled.
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    client = get_authenticated_service()

    captions_list(client,
                  part='snippet',
                  videoId='M7FIvfx5J10',
                  onBehalfOfContentOwner='')
