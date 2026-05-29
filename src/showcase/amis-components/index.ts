/**
 * Amis built-in component showcase registry.
 * Each component has its own file, re-exported here as a single array.
 */
import type { ShowcasePage } from '../data';

import alert from './alert';
import anchor_nav from './anchor-nav';
import avatar from './avatar';
import barcode from './barcode';
import bottom_underline_tab from './bottom-underline-tab';
import breadcrumb from './breadcrumb';
import button from './button';
import button_group from './button-group';
import button_toolbar from './button-toolbar';
import calendar from './calendar';
import cards from './cards';
import carousel from './carousel';
import cascader from './cascader';
import chained_select from './chained-select';
import chained_select_api from './chained-select-api';
import chart from './chart';
import checkboxes from './checkboxes';
import code from './code';
import collapse from './collapse';
import color from './color';
import combo from './combo';
import condition_builder from './condition-builder';
import container from './container';
import crud from './crud';
import custom from './custom';
import dialog from './dialog';
import divider from './divider';
import dropdown_button from './dropdown-button';
import each from './each';
import editor from './editor';
import field_with_exclude from './field-with-exclude';
import flex from './flex';
import form from './form';
import formula from './formula';
import grid from './grid';
import grid_2d from './grid-2d';
import grid_nav from './grid-nav';
import group from './group';
import hbox from './hbox';
import hidden from './hidden';
import icon from './icon';
import icon_picker from './icon-picker';
import iframe from './iframe';
import image from './image';
import images from './images';
import input_array from './input-array';
import input_color from './input-color';
import input_date from './input-date';
import input_date_range from './input-date-range';
import input_file from './input-file';
import input_group from './input-group';
import input_image from './input-image';
import input_number from './input-number';
import input_password from './input-password';
import input_range from './input-range';
import input_rating from './input-rating';
import input_rich_text from './input-rich-text';
import input_table from './input-table';
import input_tag from './input-tag';
import input_text from './input-text';
import input_tree from './input-tree';
import json from './json';
import json_schema from './json-schema';
import link from './link';
import list from './list';
import location_picker from './location-picker';
import mapping from './mapping';
import markdown from './markdown';
import matrix_checkboxes from './matrix-checkboxes';
import nav from './nav';
import page from './page';
import pagination from './pagination';
import panel from './panel';
import picker from './picker';
import popover from './popover';
import portlet from './portlet';
import progress from './progress';
import property from './property';
import qrcode from './qrcode';
import radios from './radios';
import remark from './remark';
import search_box from './search-box';
import select from './select';
import service from './service';
import service_async from './service-async';
import sparkline from './sparkline';
import spinner from './spinner';
import status from './status';
import steps from './steps';
import switchComp from './switch';
import table from './table';
import table_search from './table-search';
import tabs from './tabs';
import tabs_nav from './tabs-nav';
import tag from './tag';
import test_nested_tabs from './test-nested-tabs';
import textarea from './textarea';
import three_layer_tabs from './three-layer-tabs';
import timeline from './timeline';
import tooltip from './tooltip';
import top_border_tab from './top-border-tab';
import tpl from './tpl';
import transfer from './transfer';
import tree_select from './tree-select';
import user_select from './user-select';
import vbox from './vbox';
import wizard from './wizard';
import wrapper from './wrapper';

export const amisShowcasePages: ShowcasePage[] = [
  ...alert,
  ...anchor_nav,
  ...avatar,
  ...barcode,
  ...bottom_underline_tab,
  ...breadcrumb,
  ...button,
  ...button_group,
  ...button_toolbar,
  ...calendar,
  ...cards,
  ...carousel,
  ...cascader,
  ...chained_select,
  ...chained_select_api,
  ...chart,
  ...checkboxes,
  ...code,
  ...collapse,
  ...color,
  ...combo,
  ...condition_builder,
  ...container,
  ...crud,
  ...custom,
  ...dialog,
  ...divider,
  ...dropdown_button,
  ...each,
  ...editor,
  ...field_with_exclude,
  ...flex,
  ...form,
  ...formula,
  ...grid,
  ...grid_2d,
  ...grid_nav,
  ...group,
  ...hbox,
  ...hidden,
  ...icon,
  ...icon_picker,
  ...iframe,
  ...image,
  ...images,
  ...input_array,
  ...input_color,
  ...input_date,
  ...input_date_range,
  ...input_file,
  ...input_group,
  ...input_image,
  ...input_number,
  ...input_password,
  ...input_range,
  ...input_rating,
  ...input_rich_text,
  ...input_table,
  ...input_tag,
  ...input_text,
  ...input_tree,
  ...json,
  ...json_schema,
  ...link,
  ...list,
  ...location_picker,
  ...mapping,
  ...markdown,
  ...matrix_checkboxes,
  ...nav,
  ...page,
  ...pagination,
  ...panel,
  ...picker,
  ...popover,
  ...portlet,
  ...progress,
  ...property,
  ...qrcode,
  ...radios,
  ...remark,
  ...search_box,
  ...select,
  ...service,
  ...service_async,
  ...sparkline,
  ...spinner,
  ...status,
  ...steps,
  ...switchComp,
  ...table,
  ...table_search,
  ...tabs,
  ...tabs_nav,
  ...tag,
  ...test_nested_tabs,
  ...textarea,
  ...three_layer_tabs,
  ...timeline,
  ...tooltip,
  ...top_border_tab,
  ...tpl,
  ...transfer,
  ...tree_select,
  ...user_select,
  ...vbox,
  ...wizard,
  ...wrapper,
];
