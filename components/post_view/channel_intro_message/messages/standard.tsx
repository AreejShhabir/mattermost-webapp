// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import {FormattedDate, FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';

import {Channel} from '@mattermost/types/channels';
import {isArchivedChannel} from 'utils/channel_utils';
import {PluginComponent} from 'types/store/plugins';
import AddMembersButton from '../add_members_button';
import {getMonthLong} from 'utils/i18n';
import BoardsButton from '../boards_button';
import SetHeaderButton from '../set_header_button';

type Props = {
    channel: Channel;
    creatorName: string;
    locale: string;
    stats: any;
    usersLimit: number;
    boardComponent?: PluginComponent;
}

const StandardIntroMessage = ({
    channel,
    creatorName,
    locale,
    stats,
    usersLimit,
    boardComponent,
}: Props) => {
    const uiName = channel.display_name;
    const totalUsers = stats.total_users_count;

    const memberMessage = useMemo(() => {
        if (isArchivedChannel(channel)) {
            return null;
        }
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            return (
                <FormattedMessage
                    id='intro_messages.onlyInvited'
                    defaultMessage=' Only invited members can see this private channel.'
                />
            );
        }
        return (
            <FormattedMessage
                id='intro_messages.anyMember'
                defaultMessage=' Any member can join and read this channel.'
            />
        );
    }, [channel]);

    const createMessage = useMemo(() => {
        const date = (
            <FormattedDate
                value={channel.create_at}
                month={getMonthLong(locale)}
                day='2-digit'
                year='numeric'
            />
        );
        if (!creatorName) {
            if (channel.type === Constants.PRIVATE_CHANNEL) {
                return (
                    <FormattedMessage
                        id='intro_messages.noCreatorPrivate'
                        defaultMessage='This is the start of the {name} private channel, created on {date}.'
                        values={{name: uiName, date}}
                    />
                );
            }
            if (channel.type === Constants.OPEN_CHANNEL) {
                return (
                    <FormattedMessage
                        id='intro_messages.noCreator'
                        defaultMessage='This is the start of the {name} channel, created on {date}.'
                        values={{name: uiName, date}}
                    />
                );
            }
        }

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            return (
                <span>
                    <FormattedMessage
                        id='intro_messages.creatorPrivate'
                        defaultMessage='This is the start of the {name} private channel, created by {creator} on {date}.'
                        values={{
                            name: uiName,
                            creator: creatorName,
                            date,
                        }}
                    />
                </span>
            );
        }

        if (channel.type === Constants.OPEN_CHANNEL) {
            return (
                <span>
                    <FormattedMessage
                        id='intro_messages.creator'
                        defaultMessage='This is the start of the {name} channel, created by {creator} on {date}.'
                        values={{
                            name: uiName,
                            creator: creatorName,
                            date,
                        }}
                    />
                </span>
            );
        }
        return null;
    }, [channel.create_at, channel.type, creatorName, locale, uiName]);

    const purposeMessage = useMemo(() => {
        if (!channel.purpose) {
            return null;
        }
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            return (
                <span>
                    <FormattedMessage
                        id='intro_messages.purposePrivate'
                        defaultMessage=" This private channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            return (
                <span>
                    <FormattedMessage
                        id='intro_messages.purpose'
                        defaultMessage=" This channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        }
        return null;
    }, [channel.purpose, channel.type]);

    const renderButtons = !isArchivedChannel(channel);
    const setHeaderButton = renderButtons ? <SetHeaderButton channel={channel}/> : null;
    const boardCreateButton = renderButtons ? <BoardsButton boardComponent={boardComponent}/> : null;

    const channelInviteButton = (
        <AddMembersButton
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            setHeader={setHeaderButton}
            createBoard={boardCreateButton}
        />
    );

    return (
        <>
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: uiName,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                {createMessage}
                {memberMessage}
                {purposeMessage}
                <br/>
            </p>
            {channelInviteButton}
        </>
    );
};

export default React.memo(StandardIntroMessage);
