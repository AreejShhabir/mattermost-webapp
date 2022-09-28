// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Editor} from '@tiptap/react';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {useFloating, offset} from '@floating-ui/react-dom';
import {CSSTransition} from 'react-transition-group';
import {ChevronDownIcon} from '@mattermost/compass-icons/components';

import ToolbarControl, {
    DropdownContainer,
    makeControlActiveAssertionMap,
    makeControlHandlerMap,
    MarkdownHeadingModes,
} from './toolbar_controls';

import {useToolbarControls, useGetLatest} from './toolbar_hooks';

/** eslint-disable no-confusing-arrow */

const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.32);
`;

const ToolbarContainer = styled.div`
    display: flex;
    position: relative;
    height: 48px;
    padding: 0 8px;
    justify-content: space-between;
    background: transparent;
    transform-origin: top;
    transition: max-height 0.25s ease;
`;

const ToolSection = styled.div`
    display: flex;
    align-items: center;
    flex: 0;
    gap: 4px;
`;

const HeadingControlsContainer = styled.div`
    padding: 5px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;
    flex-direction: column;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

interface ToolbarProps {

    /**
     * the editor create from the tiptap package
     */
    editor: Editor;

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;

    /**
     * controls that enhance the message,
     * e.g: message priority picker
     */
    additionalControls?: React.ReactNodeArray;

    /**
     * controls shown aligned to the very right of the toolbar
     * (perfect for adding in send buttons, etc.)
     */
    rightControls?: React.ReactNode | React.ReactNodeArray;
}

const Toolbar = (props: ToolbarProps): JSX.Element => {
    const {
        location,
        additionalControls,
        rightControls,
        editor,
    } = props;
    const [showHeadingControls, setShowHeadingControls] = useState(false);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, wideMode} = useToolbarControls(formattingBarRef);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top-start',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the floatingUI placement calculation
    const getLatest = useGetLatest({
        showHeadingControls,
        buttonRef,
        floatingRef,
    });

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            const {floatingRef, buttonRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (
                    floatingRef !== null &&
                    buttonRef !== null &&
                    !floatingRef.current?.contains(target) &&
                    !buttonRef.current?.contains(target)
                ) {
                    setShowHeadingControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest]);

    useEffect(() => {
        update?.();
    }, [wideMode, update]);

    const toggleHeadingControls = useCallback((event?) => {
        event?.preventDefault();
        setShowHeadingControls(!showHeadingControls);
    }, [showHeadingControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const controlHandlerMap = useMemo(() => makeControlHandlerMap(editor), [editor]);
    const controlActiveAssertionMap = useMemo(() => makeControlActiveAssertionMap(editor), [editor]);

    return (
        <ToolbarContainer ref={formattingBarRef}>
            <ToolSection>
                <DropdownContainer
                    id={'HiddenControlsButton' + location}
                    ref={reference}
                    className={classNames({active: showHeadingControls})}
                    onClick={toggleHeadingControls}
                    aria-label={HiddenControlsButtonAriaLabel}
                >
                    {'Normal text'}
                    <ChevronDownIcon
                        color={'currentColor'}
                        size={18}
                    />
                </DropdownContainer>
                <CSSTransition
                    timeout={250}
                    classNames='scale'
                    in={showHeadingControls}
                >
                    <HeadingControlsContainer
                        ref={floating}
                        style={hiddenControlsContainerStyles}
                    >
                        {MarkdownHeadingModes.map((mode) => {
                            return (
                                <ToolbarControl
                                    key={mode}
                                    mode={mode}
                                    onClick={controlHandlerMap[mode]}
                                    className={classNames({active: controlActiveAssertionMap[mode]()})}
                                />
                            );
                        })}
                    </HeadingControlsContainer>
                </CSSTransition>
                <Separator/>
                {controls.map((mode) => {
                    const insertSeparator = mode === 'strike' || mode === 'ol';
                    return (
                        <React.Fragment key={mode}>
                            <ToolbarControl
                                mode={mode}
                                onClick={controlHandlerMap[mode]}
                                className={classNames({active: controlActiveAssertionMap[mode]()})}
                            />
                            {insertSeparator && <Separator/>}
                        </React.Fragment>
                    );
                })}
                {additionalControls}
            </ToolSection>
            <ToolSection>
                {rightControls}
            </ToolSection>
        </ToolbarContainer>
    );
};

export default Toolbar;