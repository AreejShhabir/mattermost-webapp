// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {BoardsSidebar, GlobalHeader, BoardsCreateModal} from '@e2e-support/ui/components';

export default class BoardsViewPage {
    readonly boards = 'Boards';
    readonly boardsAPIUrl: string;
    readonly boardsDuplicateURL: string;
    readonly boardsCreateModal: BoardsCreateModal;
    readonly duplicateBoardButton: Locator;
    readonly deleteBoardButton: Locator;
    readonly deleteBoardConfirmationButton: Locator;
    readonly editableTitle: Locator;
    readonly globalHeader: GlobalHeader;
    readonly page: Page;
    readonly sidebar: BoardsSidebar;
    readonly shareButton: Locator;
    readonly topHead: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardsAPIUrl = 'plugins/boards/api/v2/boards';
        this.boardsDuplicateURL = 'duplicate?asTemplate=false';
        this.boardsCreateModal = new BoardsCreateModal(page.locator('.menu-contents'));
        this.sidebar = new BoardsSidebar(page.locator('.octo-sidebar'));
        this.globalHeader = new GlobalHeader(this.page.locator('#global-header'));
        this.topHead = page.locator('.top-head');
        this.editableTitle = this.topHead.getByPlaceholder('Untitled board');
        this.shareButton = page.getByRole('button', {name: '󰍁 Share'});
        this.duplicateBoardButton = page.getByLabel('Duplicate board');
        this.deleteBoardButton = page.getByLabel('Delete board');
        this.deleteBoardConfirmationButton = page.locator('button.Button.filled.danger');
    }

    async goto(teamId = '', boardId = '', viewId = '', cardId = '') {
        let boardsUrl = '/boards';
        if (teamId) {
            boardsUrl += `/team/${teamId}`;
            if (boardId) {
                boardsUrl += `/${boardId}`;
                if (viewId) {
                    boardsUrl += `/${viewId}`;
                    if (cardId) {
                        boardsUrl += `/${cardId}`;
                    }
                }
            }
        }

        await this.page.goto(boardsUrl);
    }

    async toBeVisible() {
        await this.page.waitForLoadState('networkidle');
        await this.globalHeader.toBeVisible(this.boards);
        await expect(this.shareButton).toBeVisible();
        await expect(this.topHead).toBeVisible();
    }

    async shouldHaveUntitledBoard() {
        await this.editableTitle.isVisible();
        expect(await this.editableTitle.getAttribute('value')).toBe('');
        await expect(this.page.getByTitle('(Untitled Board)')).toBeVisible();
    }

    async createDuplicateBoard(boardName: string) {
        await (await this.sidebar.getBoardItem(boardName)).hover();
        await this.sidebar.activeBoardMenuIcon.click();
        await this.sidebar.boardMenuDraw.isVisible();
        await this.duplicateBoardButton.click();
        await this.page.waitForResponse(
            (response) => response.url().includes(this.boardsDuplicateURL) && response.status() === 200
        );
        expect(await this.editableTitle.getAttribute('value')).toBe(`${boardName} copy`);
    }

    async shouldHaveBoardName(boardName: string) {
        await this.editableTitle.isVisible();
        expect(await this.editableTitle.getAttribute('value')).toBe(boardName);
    }

    async deleteBoard(boardName: string) {
        await (await this.sidebar.getBoardItem(boardName)).hover();
        await this.sidebar.activeBoardMenuIcon.click();
        await this.sidebar.boardMenuDraw.isVisible();
        await this.deleteBoardButton.click();
        await this.deleteBoardConfirmationButton.click();
        await this.page.waitForResponse(
            (response) => response.url().includes(this.boardsAPIUrl) && response.status() === 200
        );
        expect((await this.sidebar.getBoardItem(boardName)).isHidden());
    }
}

export {BoardsViewPage};
