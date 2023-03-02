// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {DateTime} from 'luxon';

type Props = {
    time: number;
}

function Time({time}: Props) {
    return (
        <i>
            {DateTime.fromMillis(time).toFormat('HH:MM:ss:SSS')}
        </i>
    );
}

export default memo(Time);