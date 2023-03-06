// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';
import IconMessage from 'components/purchase_modal/icon_message';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

export default function SelfHostedExpansionErrorPage() {
    const dispatch = useDispatch();
    const contactSupportLink = useSelector(getCloudContactUsLink)(InquiryType.Technical);

    const formattedTitle = (
        <FormattedMessage
            id='admin.billing.subscription.paymentVerificationFailed'
            defaultMessage='Sorry, the payment verification failed'
        />
    );

    const formattedButtonText = (
        <FormattedMessage
            id='self_hosted_expansion.retry'
            defaultMessage='Try again'
        />
    );

    const formattedSubtitle = (
        <FormattedMessage
            id='self_hosted_expansion.paymentFailed'
            defaultMessage='Payment failed. Please try again or contact support.'
        />
    );

    const tertiaryButtonText = (
        <FormattedMessage
            id='self_hosted_expansion.contact_support'
            defaultMessage={'Contact Support'}
        />
    )

    const icon = (
        <PaymentFailedSvg
            width={444}
            height={313}
        />
    );

    return (
        <FullScreenModal
            show={true}
            onClose={() => dispatch(closeModal(ModalIdentifiers.SUCCESS_MODAL))}
        >
            <div className='failed'>
                <IconMessage
                    formattedTitle={formattedTitle}
                    formattedSubtitle={formattedSubtitle}
                    icon={icon}
                    error={true}
                    formattedButtonText={formattedButtonText}
                    buttonHandler={() => {
                        //TODO: Open self hosted expansion modal
                    }}
                    formattedTertiaryButonText={tertiaryButtonText}
                    tertiaryButtonHandler={() => window.open(contactSupportLink, '_blank', 'noopener noreferrer')}
                />
            </div>
        </FullScreenModal>
    );
}
