import { useState } from 'react';

export const AsideCategories = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onAddCategory,
  isAdmin,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAddCategory(name.trim());
    setName('');
  };

  return (
    <aside className="aside">
      <h3>Категории</h3>
      <div className="category-list">
        {categories.map((cat) => (
          <label key={cat.category_id} className="category-item">
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.category_id)}
              onChange={() => onToggleCategory(cat.category_id)}
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>

      {isAdmin && (
        <form className="add-category-form" onSubmit={handleSubmit}>
          <h4>Новая категория</h4>
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Добавить</button>
        </form>
      )}
    </aside>
  );
};