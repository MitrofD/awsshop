// @flow
import React from 'react';
import Dropdown, { DropdownItem } from '../../components/Dropdown';
import translations from '../../api/translations';

type Props = {};

type State = {
  langCode: ?string,
  dropdownShown: boolean,
};

const getSubstrName = (name: string) => name.substr(0, 3);

class NavLangSwitcher extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      langCode: translations.langCode(),
      dropdownShown: false,
    };

    const langsListObj = translations.list();
    const langsListArr = Object.keys(langsListObj);

    langsListArr.forEach((lang) => {
      const langName = langsListObj[lang];
      this.langsList[lang] = getSubstrName(langName);
    });

    const self: any = this;
    self.onClickItem = this.onClickItem.bind(this);
    self.onClickToMe = this.onClickToMe.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickItem(event: SyntheticEvent<HTMLElement>, lang: string) {
    translations.set(lang).then((langCode) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        langCode,
      });
    }).catch(Tools.emptyRejectExeption);

    this.setState({
      dropdownShown: false,
    });
  }

  onClickToMe(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();

    this.setState({
      dropdownShown: true,
    });
  }

  onLeaveDropdown() {
    this.setState({
      dropdownShown: false,
    });
  }

  unmounted = true;
  langsList = {};

  render() {
    const {
      langCode,
      dropdownShown,
    } = this.state;

    const langVal = translations.lang();
    const langsListKeys = Object.keys(this.langsList);
    let langDropdown = null;
    let arrowICOClassName = 'fas fa-angle-';

    if (dropdownShown) {
      arrowICOClassName += 'up';

      langDropdown = (
        <Dropdown
          rightSticky
          onLeave={this.onLeaveDropdown}
        >
          {langsListKeys.map((langKey) => {
            const langItemVal = this.langsList[langKey];
            const itemClassName = langKey === langCode ? 'active' : null;

            return (
              <DropdownItem
                className={itemClassName}
                data={langKey}
                key={langKey}
                onClick={this.onClickItem}
              >
                {langItemVal}
              </DropdownItem>
            );
          })}
        </Dropdown>
      );
    } else {
      arrowICOClassName += 'down';
    }

    return (
      <li className="nav-item nav-b NavLangSwitcher">
        <a
          className="nav-link"
          href="#!"
          onClick={this.onClickToMe}
        >
          {getSubstrName(langVal)} <i className={arrowICOClassName} />
        </a>
        {langDropdown}
      </li>
    );
  }
}

export default NavLangSwitcher;
