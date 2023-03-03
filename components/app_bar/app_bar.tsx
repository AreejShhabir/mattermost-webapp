// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {useSelector} from 'react-redux';

import {partition} from 'lodash';

import {useCurrentProduct, useCurrentProductId, inScope} from 'utils/products';

import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {getAppBarPluginComponents, getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';
import {suitePluginIds} from 'utils/constants';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import AppBarPluginComponent, {isAppBarPluginComponent} from './app_bar_plugin_component';
import AppBarBinding, {isAppBinding} from './app_bar_binding';
import AppBarMarketplace from './app_bar_marketplace';

import './app_bar.scss';

export default function AppBar() {
    const channelHeaderComponents = useSelector(getChannelHeaderPluginComponents);
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const appBarBindings = useSelector(getAppBarAppBindings);
    const currentProduct = useCurrentProduct();
    const currentProductId = useCurrentProductId();
    const enabled = useSelector(shouldShowAppBar);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);

    if (
        !enabled ||
        (currentProduct && !currentProduct.showAppBar)
    ) {
        return null;
    }

    const coreProductsPluginIds = [suitePluginIds.boards, suitePluginIds.focalboard, suitePluginIds.playbooks];

    const [coreProductComponents, pluginComponents] = partition(appBarPluginComponents, ({pluginId}) => {
        return coreProductsPluginIds.includes(pluginId);
    });

    const items: ReactNode[] = [
        ...coreProductComponents,
        divider,
        ...pluginComponents,
        ...channelHeaderComponents,
        ...appBarBindings,
    ].map((x) => {
        if (isAppBarPluginComponent(x)) {
            if (!inScope(x.supportedProductIds ?? null, currentProductId, currentProduct?.pluginId)) {
                return null;
            }
            return (
                <AppBarPluginComponent
                    key={x.id}
                    component={x}
                />
            );
        } else if (isAppBinding(x)) {
            if (!inScope(x.supported_product_ids ?? null, currentProductId, currentProduct?.pluginId)) {
                return null;
            }
            return (
                <AppBarBinding
                    key={`${x.app_id}_${x.label}`}
                    binding={x}
                />
            );
        }
        return x;
    });

    if (!items.some((x) => Boolean(x) && x !== divider)) {
        return null;
    }

    if (isAdmin) {
        items.push(<AppBarMarketplace key={'app_bar_marketplace'}/>);
    }

    return (
        <div className={'app-bar'}>
            {items}
        </div>
    );
}

const divider = (
    <hr
        key='divider'
        className={'app-bar__divider'}
        // eslint-disable-next-line react/no-unknown-property
        css={`
            :last-child, :first-child {
                display: none;
            }
        `}
    />
);
